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
            'items.*.product_id' => 'nullable|integer',
            'items.*.id' => 'nullable|integer',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'nullable|numeric|min:0',
        ]);

        $customerEmail = !empty($validated['customerEmail'])
            ? trim($validated['customerEmail'])
            : (auth('sanctum')->user()->email ?? null);
        $shippingName = strip_tags(trim($validated['shippingName']));
        $shippingPhone = strip_tags(trim($validated['shippingPhone']));
        $shippingAddress = strip_tags(trim($validated['shippingAddress']));

        $orderCode = 'HD' . date('ymd') . rand(1000, 9999);
        
        $subtotal = 0;
        $totalWeightGrams = 0;
        $verifiedItems = [];

        foreach ($validated['items'] as $idx => $item) {
            $qty = (int) $item['quantity'];
            $productId = $item['product_id'] ?? $item['id'] ?? null;
            $itemName = strip_tags(trim($item['name']));
            
            // Bảo vệ giá (Price Protection): Tra cứu giá niêm yết chính thức từ Database
            $authenticPrice = null;
            $itemWeight = 250; // Trọng lượng mặc định 250g cho mỗi mặt hàng Pickleball

            if ($productId) {
                try {
                    $dbProduct = DB::connection('shop')->table('products')->where('id', $productId)->first();
                    if ($dbProduct) {
                        $authenticPrice = (int) round($dbProduct->base_price);
                        if (!empty($dbProduct->specifications)) {
                            $specs = is_array($dbProduct->specifications)
                                ? $dbProduct->specifications
                                : json_decode($dbProduct->specifications, true);
                            if (!empty($specs['weight_grams'])) {
                                $itemWeight = (int) $specs['weight_grams'];
                            }
                        }
                    }
                } catch (\Throwable $e) {
                    try {
                        $dbProduct = DB::connection('main')->table('products')->where('id', $productId)->first();
                        if ($dbProduct) {
                            $authenticPrice = (int) round($dbProduct->base_price ?? $dbProduct->price ?? 0);
                        }
                    } catch (\Throwable $mEx) {
                        // ignore
                    }
                }
            }

            // Nếu không tìm thấy trong DB (sản phẩm custom/dịch vụ), dùng giá client gửi lên
            $unitPrice = ($authenticPrice !== null && $authenticPrice > 0)
                ? $authenticPrice
                : (int) round($item['price'] ?? 0);

            $itemSubtotal = $unitPrice * $qty;
            $subtotal += $itemSubtotal;
            $totalWeightGrams += ($itemWeight * $qty);

            $verifiedItems[] = [
                'id' => $idx + 1,
                'product_id' => $productId,
                'item_name' => $itemName,
                'quantity' => $qty,
                'price' => $unitPrice,
                'subtotal' => $itemSubtotal,
            ];
        }

        // Đảm bảo trọng lượng tối thiểu 200g cho kiện hàng GHN
        $totalWeightGrams = max(200, $totalWeightGrams);

        $ghnDistrictId = (int) ($validated['ghnDistrictId'] ?? 1485);
        $ghnWardCode = $validated['ghnWardCode'] ?? '1A0307';
        $feeInfo = $this->ghnService->calculateFee($ghnDistrictId, $ghnWardCode, $totalWeightGrams, (int) $subtotal);
        $shippingFee = (int) round($feeInfo['shippingFee'] ?? 0);

        // Calculate voucher discount securely on server side
        $voucherCode = !empty($validated['voucherCode']) ? strtoupper(trim($validated['voucherCode'])) : null;
        $discount = 0;
        if ($voucherCode) {
            $voucher = \App\Modules\Shop\Models\Voucher::where('code', $voucherCode)->first();
            if ($voucher && $voucher->isValidForAmount($subtotal)) {
                $discount = (int) round($voucher->calculateDiscount($subtotal));
                $voucher->increment('used_count');
            }
        } elseif (!empty($validated['discount'])) {
            $discount = (int) round($validated['discount']);
        }

        $totalAmount = (int) max(0, $subtotal + $shippingFee - $discount);

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
            'shipping_weight_grams' => $totalWeightGrams,
            'subtotal' => $subtotal,
            'voucher_code' => $voucherCode,
            'discount' => $discount,
            'total_amount' => $totalAmount,
            'payment_method' => $validated['paymentMethod'],
            'payment_status' => $paymentStatus,
            'status' => 'pending',
            'created_at' => now()->toIso8601String(),
            'items' => $verifiedItems,
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

        if (!$isValidSignature) {
            Log::warning("MoMo callback invalid signature for order {$orderCode}");
            return response()->json([
                'success' => false,
                'orderCode' => $orderCode,
                'resultCode' => 99,
                'message' => 'Chữ ký giao dịch MoMo không hợp lệ (Signature mismatch).',
            ], 400);
        }

        if ($resultCode === '0' || $resultCode === 0) {
            // Cập nhật Cache
            $orders = Cache::get('demopick_orders_store', []);
            $wasAlreadyPaid = (isset($orders[$orderCode]) && ($orders[$orderCode]['payment_status'] ?? '') === 'paid');

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
                        if ($order->payment_status === 'paid') {
                            $wasAlreadyPaid = true;
                        }
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

            // Gửi email xác nhận hóa đơn chỉ khi chưa từng thanh toán (tránh gửi lặp khi refresh trang)
            if (!$wasAlreadyPaid && !empty($orderCode) && isset($orders[$orderCode])) {
                $targetEmail = $orders[$orderCode]['customer_email'] ?? null;
                if (!empty($targetEmail)) {
                    try {
                        Mail::to($targetEmail)->send(new OrderConfirmationMail($orders[$orderCode]));
                        Log::info("Đã gửi email hóa đơn MoMo thành công cho #{$orderCode} tới {$targetEmail}");
                    } catch (\Throwable $mEx) {
                        Log::warning("Gửi email xác nhận MoMo thất bại (fail-safe): " . $mEx->getMessage());
                    }
                }
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

            // Idempotency: Kiểm tra nếu đơn hàng đã được ghi nhận thanh toán trước đó thì bỏ qua xử lý lặp
            if (isset($orders[$orderCode]) && ($orders[$orderCode]['payment_status'] ?? '') === 'paid') {
                return response()->json([
                    'message' => 'Giao dịch đã được xác nhận trước đó (Idempotent)',
                    'resultCode' => 0,
                ], 200);
            }

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
     * Tự động hoàn lại số lượng tồn kho (Restock) khi đơn hàng bị hủy hoặc chuyển sang hoàn tiền
     */
    protected function restockOrderItems(array $items, string $orderCode): void
    {
        try {
            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? $item['qty'] ?? 0);
                if ($qty <= 0) {
                    continue;
                }

                $productId = $item['product_id'] ?? null;
                $itemName = $item['item_name'] ?? $item['name'] ?? null;

                if ($productId) {
                    DB::connection('main')->table('products')->where('id', $productId)->increment('stock_quantity', $qty);
                } elseif ($itemName) {
                    DB::connection('main')->table('products')->where('name', $itemName)->increment('stock_quantity', $qty);
                }
            }
            Log::info("Hoàn kho (Restock) tự động thành công cho đơn hàng #{$orderCode}");
        } catch (\Throwable $e) {
            Log::warning("Restock kho cho đơn hàng #{$orderCode} gặp lỗi (bỏ qua an toàn): " . $e->getMessage());
        }
    }

    /**
     * Khách hàng / Quản trị viên hủy đơn hàng (Tuân thủ Quy tắc Khóa Vận Chuyển & Phân Luồng Tài Chính)
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

        $paymentStatus = strtolower($targetOrder['payment_status'] ?? 'unpaid');
        $paymentMethod = strtolower($targetOrder['payment_method'] ?? 'cod');
        $isPaid = ($paymentStatus === 'paid');

        $items = $targetOrder['items'] ?? [];

        // 1. Tự động hoàn trả số lượng vào tồn kho (Restock)
        $this->restockOrderItems($items, $code);

        // 2. Phân luồng tài chính:
        if ($isPaid) {
            // Đơn Online đã thanh toán: Chuyển sang REFUND_PENDING chờ Admin xác nhận hoàn tiền
            $refundAmount = (float) ($targetOrder['total_amount'] ?? 0);
            $message = "Đơn hàng #{$code} đã được thanh toán Online trước đó. Hệ thống đã ghi nhận yêu cầu hủy và chuyển sang trạng thái CHỜ HOÀN TIỀN. Quản trị viên sẽ kiểm tra và thực hiện hoàn tiền cho bạn.";

            // Bắn thông báo Admin vào Cache
            $adminNotifications = Cache::get('demopick_admin_notifications', []);
            $adminNotifications[] = [
                'id' => 'notif_' . time() . '_' . rand(100, 999),
                'type' => 'refund_request',
                'title' => "Yêu cầu hoàn tiền đơn hàng #{$code}",
                'content' => "Khách hàng yêu cầu hủy đơn hàng đã thanh toán Online số tiền " . number_format($refundAmount) . " VNĐ. Lý do: {$reason}",
                'order_code' => $code,
                'amount' => $refundAmount,
                'created_at' => now()->toIso8601String(),
                'is_read' => false,
            ];
            Cache::put('demopick_admin_notifications', array_slice($adminNotifications, -50), 86400 * 30);

            // Cập nhật Cache Order
            if (isset($orders[$code])) {
                $orders[$code]['status'] = 'refund_pending';
                $orders[$code]['refund_status'] = 'pending';
                $orders[$code]['refund_reason'] = $reason;
                $orders[$code]['refund_amount'] = $refundAmount;
                $orders[$code]['refund_requested_at'] = now()->toIso8601String();
                Cache::put('demopick_orders_store', $orders, 86400 * 30);
            }

            // Cập nhật Database Order
            try {
                $updateData = [
                    'status' => 'refund_pending',
                    'updated_at' => now(),
                ];
                if ($dbOrder) {
                    DB::connection('main')->table('orders')->where('id', $dbOrder->id)->update($updateData);
                } else {
                    DB::connection('main')->table('orders')->where('order_code', $code)->update($updateData);
                }
            } catch (\Throwable $e) {
                Log::info('Order refund_pending DB update: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'action' => 'refund_pending',
                'message' => $message,
                'data' => [
                    'order_code' => $code,
                    'status' => 'refund_pending',
                    'refund_amount' => $refundAmount,
                    'cancel_reason' => $reason,
                ],
            ]);
        }

        // Đơn COD / Chưa thanh toán: Hủy ngay lập tức
        $message = "Đã hủy đơn hàng COD #{$code} thành công và hoàn trả số lượng vào tồn kho.";

        // Cập nhật Cache Order
        if (isset($orders[$code])) {
            $orders[$code]['status'] = 'cancelled';
            $orders[$code]['cancel_reason'] = $reason;
            Cache::put('demopick_orders_store', $orders, 86400 * 30);
        }

        // Cập nhật Database Order
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
            'action' => 'cancelled',
            'message' => $message,
            'data' => [
                'order_code' => $code,
                'status' => 'cancelled',
                'cancel_reason' => $reason,
            ],
        ]);
    }
}
