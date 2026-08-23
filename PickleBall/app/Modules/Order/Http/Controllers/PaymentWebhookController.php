<?php

namespace App\Modules\Order\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Booking\Models\CourtSlot;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\Payment;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    use HasStandardResponse;

    /**
     * Webhook MoMo IPN
     */
    public function momoWebhook(Request $request): JsonResponse
    {
        $orderCode = $request->input('orderId');
        $resultCode = $request->input('resultCode');
        $transId = $request->input('transId');
        $amount = (float) $request->input('amount', 0);

        Log::info("MoMo Webhook received for order {$orderCode}, transId: {$transId}, resultCode: {$resultCode}");

        $order = Order::where('order_code', $orderCode)->first();

        if (! $order) {
            return $this->error('Order not found', 404);
        }

        if ((int) $resultCode === 0) {
            // Payment success
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);

            Payment::where('order_id', $order->id)->update([
                'status' => 'success',
                'transaction_id' => $transId,
                'paid_at' => now(),
                'gateway_response' => $request->all(),
            ]);

            // Cập nhật các slot đặt sân liên quan sang booked
            $this->confirmBookingSlots($order);

            return $this->success(null, 'MoMo IPN processed successfully.');
        }

        // Payment failed
        Payment::where('order_id', $order->id)->update([
            'status' => 'failed',
            'gateway_response' => $request->all(),
        ]);

        return $this->success(null, 'MoMo IPN payment failed status recorded.');
    }

    /**
     * Webhook Cấp 2 Tự Động: VietQR / SePay / Casso / MBBank / Vietcombank Gateway
     */
    public function vietqrWebhook(Request $request): JsonResponse
    {
        // SePay / Casso payload format: { content, transferAmount, referenceCode, gateway, ... }
        $content = $request->input('content') ?? $request->input('description') ?? $request->input('transferContent') ?? '';
        $amount = (float) ($request->input('transferAmount') ?? $request->input('amount') ?? 0);
        $gateway = $request->input('gateway') ?? $request->input('bankName') ?? 'VietQR Bank';
        $refCode = $request->input('referenceCode') ?? $request->input('transactionId') ?? ('TX-'.rand(10000, 99999));

        Log::info("VietQR/Bank Webhook (Cấp 2) received: amount={$amount}, gateway={$gateway}, content={$content}");

        // Trích xuất mã đơn hàng dạng DP-XXXX từ nội dung chuyển khoản
        preg_match('/DP-[\w\d]+/i', $content, $matches);
        $orderCode = $matches[0] ?? $request->input('orderCode') ?? null;

        if (! $orderCode) {
            Log::warning("VietQR Webhook: Không tìm thấy mã đơn hàng hợp lệ trong nội dung: '{$content}'");

            return $this->error('Không tìm thấy mã đơn hàng trong nội dung thanh toán', 422);
        }

        $order = Order::where('order_code', strtoupper($orderCode))->first();

        if (! $order) {
            Log::warning("VietQR Webhook: Đơn hàng '{$orderCode}' không tồn tại trong hệ thống.");

            return $this->error("Không tìm thấy đơn hàng #{$orderCode}", 404);
        }

        // Kiểm tra số tiền (nếu khớp hoặc lớn hơn)
        if ($amount > 0 && $amount < (float) $order->total_amount) {
            Log::warning("VietQR Webhook: Số tiền thanh toán ({$amount}) nhỏ hơn giá trị đơn hàng ({$order->total_amount})");
        }

        // Cập nhật trạng thái đơn sang ĐÃ THANH TOÁN (PAID / CONFIRMED)
        $order->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'payment_method' => 'bank_transfer',
                'amount' => $amount > 0 ? $amount : $order->total_amount,
                'status' => 'success',
                'transaction_id' => $refCode,
                'paid_at' => now(),
                'gateway_response' => $request->all(),
            ]
        );

        // Tự động chuyển các slot đặt sân sang BOOKED
        $this->confirmBookingSlots($order);

        Log::info("🎉 [Webhook Cấp 2]: Đơn hàng #{$order->order_code} đã thanh toán tự động thành công {$amount}đ qua {$gateway}!");

        return $this->success([
            'order_code' => $order->order_code,
            'payment_status' => 'paid',
            'amount_received' => $amount,
            'gateway' => $gateway,
        ], 'Webhook Cấp 2 tự động xác nhận thanh toán thành công.');
    }

    /**
     * Xác nhận các ca sân gắn với đơn hàng
     */
    private function confirmBookingSlots(Order $order): void
    {
        try {
            $orderItems = $order->items()->where('item_type', 'booking')->get();
            foreach ($orderItems as $item) {
                if (! empty($item->court_slot_id)) {
                    CourtSlot::where('id', $item->court_slot_id)->update([
                        'status' => 'booked',
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error('Lỗi khi xác nhận slot đặt sân từ Webhook: '.$e->getMessage());
        }
    }
}
