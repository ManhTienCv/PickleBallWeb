<?php

namespace App\Modules\Order\Services;

use App\Modules\Order\Models\Order;

class PaymentService
{
    public function createPaymentPayload(Order $order, string $gateway): array
    {
        return match ($gateway) {
            'momo' => $this->generateMomoPayload($order),
            'bank_transfer' => $this->generateBankTransferPayload($order),
            'cash' => $this->generateCashPayload($order),
            default => throw new \InvalidArgumentException("Cổng thanh toán [{$gateway}] không được hỗ trợ."),
        };
    }

    protected function generateBankTransferPayload(Order $order): array
    {
        $bankId = 'MB'; // MB Bank
        $accountNo = '0900000001';
        $accountName = 'DEMOPICK SPORTS CENTER';
        $amount = (int) $order->total_amount;
        $addInfo = urlencode($order->order_code);

        $qrCodeUrl = "https://img.vietqr.io/image/{$bankId}-{$accountNo}-compact2.png?amount={$amount}&addInfo={$addInfo}&accountName=".urlencode($accountName);

        return [
            'payment_method' => 'bank_transfer',
            'qr_code_url' => $qrCodeUrl,
            'bank_info' => [
                'bank_name' => 'MB Bank (Ngân hàng Quân Đội)',
                'account_number' => $accountNo,
                'account_name' => $accountName,
                'amount' => $amount,
                'transfer_content' => $order->order_code,
            ],
        ];
    }

    protected function generateMomoPayload(Order $order): array
    {
        // Sandbox MoMo mock payload for MVP demo
        $redirectUrl = config('services.momo.redirect_url', env('FRONTEND_URL', 'http://localhost:5173').'/order/success?code='.$order->order_code);

        return [
            'payment_method' => 'momo',
            'payment_url' => $redirectUrl,
            'partner_code' => 'MOMO_DEMOPICK',
            'order_id' => $order->order_code,
            'amount' => (int) $order->total_amount,
        ];
    }

    protected function generateCashPayload(Order $order): array
    {
        return [
            'payment_method' => 'cash',
            'notes' => 'Thanh toán trực tiếp bằng tiền mặt khi nhận hàng/vào sân.',
        ];
    }
}
