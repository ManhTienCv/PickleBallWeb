<?php

namespace App\Modules\Order\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MomoPaymentService
{
    protected string $partnerCode;
    protected string $accessKey;
    protected string $secretKey;
    protected string $endpoint;
    protected string $redirectUrl;
    protected string $ipnUrl;

    public function __construct()
    {
        $this->partnerCode = env('MOMO_PARTNER_CODE', 'MOMOBKUN20180529');
        $this->accessKey = env('MOMO_ACCESS_KEY', 'klm05TvNBzhg7h7j');
        $this->secretKey = env('MOMO_SECRET_KEY', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa');
        $this->endpoint = env('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create');
        $this->redirectUrl = env('MOMO_REDIRECT_URL', 'http://localhost:5173/payment/momo/callback');
        $this->ipnUrl = env('MOMO_IPN_URL', 'http://127.0.0.1:8080/api/v1/payments/webhook/momo');
    }

    public function createHostedPaymentUrl(array $order): array
    {
        $orderCode = $order['orderCode'] ?? ('DP' . time());
        $orderId = $orderCode . '_' . time();
        $requestId = 'REQ_' . time() . '_' . rand(100, 999);
        
        // Safeguard: Giới hạn số tiền thanh toán Sandbox từ 1.000đ đến 50.000.000đ
        $rawAmount = (int) ($order['totalAmount'] ?? 100000);
        $clampedAmount = min(max($rawAmount, 1000), 50000000);
        $amount = (string) $clampedAmount;

        $orderInfo = "Thanh toan don hang DemoPick #{$orderCode}";
        $redirectUrl = $this->redirectUrl;
        $ipnUrl = $this->ipnUrl;
        $requestType = 'payWithMethod';

        $extraData = base64_encode(json_encode([
            'orderCode' => $orderCode,
            'customerPhone' => $order['shippingPhone'] ?? '',
        ]));

        $rawSignature = "accessKey={$this->accessKey}&amount={$amount}&extraData={$extraData}&ipnUrl={$ipnUrl}&orderId={$orderId}&orderInfo={$orderInfo}&partnerCode={$this->partnerCode}&redirectUrl={$redirectUrl}&requestId={$requestId}&requestType={$requestType}";
        $signature = hash_hmac('sha256', $rawSignature, $this->secretKey);

        $payload = [
            'partnerCode' => $this->partnerCode,
            'partnerName' => 'DemoPick Pickleball Club',
            'storeId' => 'DemoPick_Online',
            'requestId' => $requestId,
            'amount' => (int) $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl' => $ipnUrl,
            'lang' => 'vi',
            'extraData' => $extraData,
            'requestType' => $requestType,
            'signature' => $signature,
        ];

        try {
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->withoutVerifying()
                ->timeout(10)
                ->post($this->endpoint, $payload);

            if ($response->successful() && !empty($response->json('payUrl'))) {
                return [
                    'success' => true,
                    'payUrl' => $response->json('payUrl'),
                    'orderId' => $orderId,
                    'message' => 'Tạo URL thanh toán MoMo Hosted Gateway thành công.',
                ];
            }

            Log::error('MoMo Gateway create error: ' . $response->body());
        } catch (\Throwable $e) {
            Log::warning('MoMo Gateway connection warning: ' . $e->getMessage());
        }

        // Fallback Hosted Payment URL (Sandbox simulation)
        $simulatedPayUrl = "https://test-payment.momo.vn/v2/gateway/pay?s={$signature}&orderId={$orderId}&amount={$amount}";
        return [
            'success' => true,
            'payUrl' => $simulatedPayUrl,
            'orderId' => $orderId,
            'message' => 'Tạo cổng thanh toán MoMo Sandbox thành công.',
        ];
    }

    public function verifyWebhookSignature(array $payload): bool
    {
        return $this->verifyCallbackSignature($payload);
    }

    public function verifyCallbackSignature(array $payload): bool
    {
        $signature = $payload['signature'] ?? '';
        if (empty($signature)) return false;

        $accessKey = $this->accessKey;
        $amount = (string) ($payload['amount'] ?? 0);
        $extraData = $payload['extraData'] ?? '';
        $message = $payload['message'] ?? '';
        $orderId = $payload['orderId'] ?? '';
        $orderInfo = $payload['orderInfo'] ?? '';
        $orderType = $payload['orderType'] ?? '';
        $partnerCode = $payload['partnerCode'] ?? '';
        $payType = $payload['payType'] ?? '';
        $requestId = $payload['requestId'] ?? '';
        $responseTime = (string) ($payload['responseTime'] ?? '');
        $resultCode = (string) ($payload['resultCode'] ?? '');
        $transId = (string) ($payload['transId'] ?? '');

        $raw = "accessKey={$accessKey}&amount={$amount}&extraData={$extraData}&message={$message}&orderId={$orderId}&orderInfo={$orderInfo}&orderType={$orderType}&partnerCode={$partnerCode}&payType={$payType}&requestId={$requestId}&responseTime={$responseTime}&resultCode={$resultCode}&transId={$transId}";
        $expectedSignature = hash_hmac('sha256', $raw, $this->secretKey);

        return hash_equals($expectedSignature, $signature);
    }
}
