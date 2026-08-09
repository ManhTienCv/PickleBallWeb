<?php

namespace App\Modules\Order\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    use HasStandardResponse;

    public function momoWebhook(Request $request): JsonResponse
    {
        $orderCode = $request->input('orderId');
        $resultCode = $request->input('resultCode');
        $transId = $request->input('transId');

        $order = Order::where('order_code', $orderCode)->first();

        if (!$order) {
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

            return $this->success(null, 'MoMo IPN processed successfully.');
        }

        // Payment failed
        Payment::where('order_id', $order->id)->update([
            'status' => 'failed',
            'gateway_response' => $request->all(),
        ]);

        return $this->success(null, 'MoMo IPN payment failed status recorded.');
    }
}
