<?php

namespace App\Modules\Order\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmationMail;
use App\Modules\Order\Services\MomoPaymentService;
use App\Modules\Order\Services\GhnShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderApiController extends Controller
{
    protected MomoPaymentService $momoService;
    protected GhnShippingService $ghnService;

    public function __construct(MomoPaymentService $momoService, GhnShippingService $ghnService)
    {
        $this->momoService = $momoService;
        $this->ghnService = $ghnService;
    }

    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customerEmail' => 'nullable|email',
            'shippingName' => 'required|string',
            'shippingPhone' => 'required|string',
            'shippingAddress' => 'required|string',
            'ghnProvinceId' => 'nullable|integer',
            'ghnDistrictId' => 'nullable|integer',
            'ghnWardCode' => 'nullable|string',
            'paymentMethod' => 'required|in:momo,cod,cash,bank_transfer',
            'voucherCode' => 'nullable|string',
            'discount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $customerEmail = !empty($validated['customerEmail'])
            ? trim($validated['customerEmail'])
            : (auth('sanctum')->user()->email ?? null);
        $shippingName = strip_tags(trim($validated['shippingName']));
        $shippingPhone = strip_tags(trim($validated['shippingPhone']));
        $shippingAddress = strip_tags(trim($validated['shippingAddress']));

        $orderCode = 'HD' . date('ymd') . rand(1000, 9999);
        
        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $subtotal += ($item['price'] * $item['quantity']);
        }

        $ghnDistrictId = (int) ($validated['ghnDistrictId'] ?? 1485);
        $ghnWardCode = $validated['ghnWardCode'] ?? '1A0307';
        $feeInfo = $this->ghnService->calculateFee($ghnDistrictId, $ghnWardCode, 700, (int) $subtotal);
        $shippingFee = (int) ($feeInfo['shippingFee'] ?? 0);

        // Calculate voucher discount securely on server side
        $voucherCode = !empty($validated['voucherCode']) ? strtoupper(trim($validated['voucherCode'])) : null;
        $discount = 0;
        if ($voucherCode) {
            $voucher = \App\Modules\Shop\Models\Voucher::where('code', $voucherCode)->first();
            if ($voucher && $voucher->isValidForAmount($subtotal)) {
                $discount = $voucher->calculateDiscount($subtotal);
                $voucher->increment('used_count');
            }
        } elseif (!empty($validated['discount'])) {
            $discount = (float) $validated['discount'];
        }

        $totalAmount = max(0, $subtotal + $shippingFee - $discount);

        if ($validated['paymentMethod'] === 'momo' && $totalAmount < 1000) {
            return response()->json([
                'success' => false,
                'message' => 'Số tiền thanh toán qua MoMo tối thiểu phải từ 1.000 VNĐ.',
            ], 422);
        }

        $paymentStatus = 'unpaid';
        $orderRecord = [
            'id' => rand(1000, 99999),
            'order_code' => $orderCode,
            'customer_name' => $shippingName,
            'customer_phone' => $shippingPhone,
            'customer_email' => $customerEmail,
            'shipping_address' => $shippingAddress,
            'shipping_carrier' => 'GHN Express',
            'shipping_fee' => $shippingFee,
            'subtotal' => $subtotal,
            'voucher_code' => $voucherCode,
            'discount' => $discount,
            'total_amount' => $totalAmount,
            'payment_method' => $validated['paymentMethod'],
            'payment_status' => $paymentStatus,
            'status' => 'pending',
            'created_at' => now()->toIso8601String(),
            'items' => array_map(function ($it, $idx) {
                return [
                    'id' => $idx + 1,
                    'item_name' => $it['name'],
                    'quantity' => $it['quantity'],
                    'price' => (int) $it['price'],
                    'subtotal' => (int) ($it['price'] * $it['quantity']),
                ];
            }, $validated['items'], array_keys($validated['items'])),
        ];

        $existingOrders = Cache::get('demopick_orders_store', []);
        $existingOrders[$orderCode] = $orderRecord;
        Cache::put('demopick_orders_store', $existingOrders, 86400 * 30);

        try {
            $userId = auth('sanctum')->id() ?? 1;
            DB::connection('main')->table('orders')->insert([
                'order_code' => $orderCode,
                'user_id' => $userId,
                'order_type' => 'shop',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'pickup_notes' => json_encode([
                    'shippingName' => $shippingName,
                    'shippingPhone' => $shippingPhone,
                    'shippingAddress' => $shippingAddress,
                    'customerEmail' => $customerEmail,
                    'paymentMethod' => $validated['paymentMethod'],
                    'voucherCode' => $voucherCode,
                    'discount' => $discount,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::info('Order cached. DB note: ' . $e->getMessage());
        }

        $payUrl = null;
        if ($validated['paymentMethod'] === 'momo') {
            $paymentResult = $this->momoService->createHostedPaymentUrl([
                'orderCode' => $orderCode,
                'totalAmount' => $totalAmount,
                'shippingPhone' => $shippingPhone,
            ]);
            $payUrl = $paymentResult['payUrl'] ?? null;

            try {
                $orderIdInDb = DB::connection('main')->table('orders')->where('order_code', $orderCode)->value('id');
                if ($orderIdInDb) {
                    DB::connection('main')->table('payments')->insert([
                        'order_id' => $orderIdInDb,
                        'transaction_id' => $paymentResult['orderId'] ?? ($orderCode . '_' . time()),
                        'gateway' => 'momo',
                        'amount' => $totalAmount,
                        'status' => 'pending',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::info('MoMo payment transaction record note: ' . $e->getMessage());
            }
        }

        // Gửi email xác nhận đơn hàng tự động (Bất đồng bộ & fail-safe cho đơn COD)
        if (!empty($customerEmail) && $validated['paymentMethod'] !== 'momo') {
            try {
                Mail::to($customerEmail)->send(new OrderConfirmationMail($orderRecord));
                Log::info("Đã gửi email xác nhận hóa đơn đơn hàng #{$orderCode} tới {$customerEmail}");
            } catch (\Throwable $mailEx) {
                Log::warning("Gửi email xác nhận đơn hàng #{$orderCode} thất bại (fail-safe): " . $mailEx->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'orderCode' => $orderCode,
                'totalAmount' => $totalAmount,
                'paymentMethod' => $validated['paymentMethod'],
                'paymentStatus' => $paymentStatus,
                'payUrl' => $payUrl,
            ],
            'message' => 'Tạo đơn hàng thành công.',
        ]);
    }

    public function index(): JsonResponse
    {
        $orders = Cache::get('demopick_orders_store', []);
        return response()->json([
            'success' => true,
            'data' => array_values($orders),
        ]);
    }

    public function show(string $code): JsonResponse
    {
        $orders = Cache::get('demopick_orders_store', []);
        $order = $orders[$code] ?? null;

        if (!$order) {
            try {
                $dbOrder = DB::connection('main')->table('orders')->where('order_code', $code)->first();
                if ($dbOrder) {
                    $notes = json_decode($dbOrder->pickup_notes ?? '{}', true) ?: [];
                    $dbItems = DB::connection('main')->table('order_items')->where('order_id', $dbOrder->id)->get();
                    $items = $dbItems->map(function ($it, $idx) {
                        return [
                            'id' => $it->id ?? ($idx + 1),
                            'item_name' => $it->item_name,
                            'quantity' => (int) $it->quantity,
                            'price' => (float) $it->unit_price,
                            'subtotal' => (float) $it->total_price,
                        ];
                    })->toArray();

                    $order = [
                        'id' => $dbOrder->id,
                        'order_code' => $dbOrder->order_code,
                        'customer_name' => $notes['shippingName'] ?? 'Khách hàng DemoPick',
                        'customer_phone' => $notes['shippingPhone'] ?? '',
                        'shipping_address' => $notes['shippingAddress'] ?? '',
                        'shipping_carrier' => 'GHN Express',
                        'shipping_fee' => 0,
                        'total_amount' => (int) $dbOrder->total_amount,
                        'payment_method' => $notes['paymentMethod'] ?? 'cod',
                        'payment_status' => $dbOrder->payment_status,
                        'status' => $dbOrder->status,
                        'created_at' => $dbOrder->created_at,
                        'items' => $items,
                    ];
                }
            } catch (\Throwable $e) {
                Log::warning('DB order search fallback note: ' . $e->getMessage());
            }
        }

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => ['order' => $order],
        ]);
    }

    public function momoVerify(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = $payload['orderId'] ?? '';
        $resultCode = (string) ($payload['resultCode'] ?? '-1');
        $transId = (string) ($payload['transId'] ?? '');
        $message = $payload['message'] ?? 'Thành công';

        $orderCode = '';
        if (!empty($orderId)) {
            $orderCode = explode('_', $orderId)[0];
        }
        if (empty($orderCode) && !empty($payload['extraData'])) {
            $decoded = json_decode(base64_decode($payload['extraData']), true);
            $orderCode = $decoded['orderCode'] ?? '';
        }

        $isValidSignature = $this->momoService->verifyCallbackSignature($payload);

        if ($resultCode === '0' || $resultCode === 0) {
            // Cập nhật Cache
            $orders = Cache::get('demopick_orders_store', []);
            if (!empty($orderCode) && isset($orders[$orderCode])) {
                $orders[$orderCode]['payment_status'] = 'paid';
                $orders[$orderCode]['status'] = 'confirmed';
                $orders[$orderCode]['trans_id'] = $transId;
                Cache::put('demopick_orders_store', $orders, 86400 * 30);
            }

            // Cập nhật Database
            try {
                if (!empty($orderCode)) {
                    $order = DB::connection('main')->table('orders')->where('order_code', $orderCode)->first();
                    if ($order) {
                        DB::connection('main')->table('orders')->where('id', $order->id)->update([
                            'payment_status' => 'paid',
                            'status' => 'confirmed',
                            'updated_at' => now(),
                        ]);

                        DB::connection('main')->table('payments')->where('order_id', $order->id)->update([
                            'status' => 'success',
                            'transaction_id' => $transId ?: $orderId,
                            'paid_at' => now(),
                            'gateway_response' => json_encode($payload),
                            'updated_at' => now(),
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('MoMo verify DB update note: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'orderCode' => $orderCode,
                'resultCode' => 0,
                'transId' => $transId,
                'message' => 'Giao dịch thanh toán MoMo thành công.',
            ]);
        }

        // Giao dịch không thành công hoặc người dùng hủy
        try {
            if (!empty($orderCode)) {
                $order = DB::connection('main')->table('orders')->where('order_code', $orderCode)->first();
                if ($order) {
                    DB::connection('main')->table('payments')->where('order_id', $order->id)->update([
                        'status' => 'failed',
                        'gateway_response' => json_encode($payload),
                        'updated_at' => now(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('MoMo verify failure DB note: ' . $e->getMessage());
        }

        return response()->json([
            'success' => false,
            'orderCode' => $orderCode,
            'resultCode' => (int) $resultCode,
            'message' => $message ?: 'Thanh toán MoMo không thành công hoặc người dùng đã hủy giao dịch.',
        ], 400);
    }

    public function momoWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $isValid = $this->momoService->verifyWebhookSignature($payload);

        if (!$isValid) {
            return response()->json([
                'message' => 'Invalid HMAC signature',
                'resultCode' => 99,
            ], 400);
        }

        $resultCode = (int) ($payload['resultCode'] ?? -1);
        $orderId = $payload['orderId'] ?? '';
        $orderCode = explode('_', $orderId)[0];
        $transId = (string) ($payload['transId'] ?? '');

        if ($resultCode === 0 && !empty($orderCode)) {
            $orders = Cache::get('demopick_orders_store', []);
            if (isset($orders[$orderCode])) {
                $orders[$orderCode]['payment_status'] = 'paid';
                $orders[$orderCode]['status'] = 'confirmed';
                $orders[$orderCode]['trans_id'] = $transId;
                Cache::put('demopick_orders_store', $orders, 86400 * 30);
            }

            try {
                $order = DB::connection('main')->table('orders')->where('order_code', $orderCode)->first();
                if ($order) {
                    DB::connection('main')->table('orders')->where('id', $order->id)->update([
                        'payment_status' => 'paid',
                        'status' => 'confirmed',
                        'updated_at' => now(),
                    ]);

                    DB::connection('main')->table('payments')->where('order_id', $order->id)->update([
                        'status' => 'success',
                        'transaction_id' => $transId ?: $orderId,
                        'paid_at' => now(),
                        'gateway_response' => json_encode($payload),
                        'updated_at' => now(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('MoMo IPN DB update note: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Webhook received successfully',
            'resultCode' => 0,
        ]);
    }

    /**
     * Khách hàng / Quản trị viên hủy đơn hàng (Tuân thủ Quy tắc Khóa Hủy Đơn)
     */
    public function cancelOrder(Request $request, string $code): JsonResponse
    {
        $reason = $request->input('reason', 'Khách hàng yêu cầu hủy đơn');

        $orders = Cache::get('demopick_orders_store', []);
        $targetOrder = $orders[$code] ?? null;

        $dbOrder = null;
        if (!$targetOrder) {
            try {
                $dbOrder = DB::connection('main')->table('orders')->where('order_code', $code)->first();
                if ($dbOrder) {
                    $targetOrder = (array) $dbOrder;
                }
            } catch (\Throwable $e) {
                Log::warning('DB find order in cancel error: ' . $e->getMessage());
            }
        }

        if (!$targetOrder) {
            return response()->json([
                'success' => false,
                'message' => "Không tìm thấy mã đơn hàng #{$code}.",
            ], 404);
        }

        $currentStatus = strtolower($targetOrder['status'] ?? 'pending');

        // QUY TẮC BẢO MẬT & VẬN HÀNH: Khóa cứng nếu đơn đã chuyển sang giao hàng
        $lockedStatuses = ['shipping', 'delivering', 'delivered', 'shipped'];
        if (in_array($currentStatus, $lockedStatuses)) {
            return response()->json([
                'success' => false,
                'error_code' => 'ORDER_LOCKED_CANNOT_CANCEL',
                'message' => "Không thể hủy đơn hàng #{$code} vì kiện hàng đã được xuất kho và đang trong quá trình vận chuyển (GHN Express).",
            ], 422);
        }

        // Cập nhật Cache
        if (isset($orders[$code])) {
            $orders[$code]['status'] = 'cancelled';
            $orders[$code]['cancel_reason'] = $reason;
            Cache::put('demopick_orders_store', $orders, 86400 * 30);
        }

        // Cập nhật Database
        try {
            if ($dbOrder) {
                DB::connection('main')->table('orders')->where('id', $dbOrder->id)->update([
                    'status' => 'cancelled',
                    'updated_at' => now(),
                ]);
            } else {
                DB::connection('main')->table('orders')->where('order_code', $code)->update([
                    'status' => 'cancelled',
                    'updated_at' => now(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::info('Order cancel DB update: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Đã hủy đơn hàng #{$code} thành công.",
            'data' => [
                'order_code' => $code,
                'status' => 'cancelled',
                'cancel_reason' => $reason,
            ],
        ]);
    }
}
