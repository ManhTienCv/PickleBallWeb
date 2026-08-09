<?php

namespace App\Modules\Order\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Order\Http\Requests\CheckoutRequest;
use App\Modules\Order\Services\CheckoutOrchestrator;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    use HasStandardResponse;

    public function __construct(protected CheckoutOrchestrator $orchestrator)
    {
    }

    public function store(CheckoutRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $cartId = $request->input('cart_id');
        $gateway = $request->input('payment_gateway');
        $pickupNotes = $request->input('pickup_notes');

        $result = $this->orchestrator->processCheckout($userId, $cartId, $gateway, $pickupNotes);

        return $this->created($result, 'Đặt hàng thành công! Đang chờ thanh toán.');
    }
}
