<?php

namespace App\Modules\Order\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Order\Http\Resources\OrderResource;
use App\Modules\Order\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use HasStandardResponse;

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $orders = Order::with(['items', 'payment'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate(10);

        return $this->success(
            OrderResource::collection($orders->items()),
            'Danh sách đơn hàng của bạn.',
            200,
            [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ]
        );
    }

    public function show(Request $request, string $code): JsonResponse
    {
        $userId = $request->user()->id;

        $order = Order::with(['items', 'payment'])
            ->where('order_code', $code)
            ->where('user_id', $userId)
            ->firstOrFail();

        return $this->success(new OrderResource($order), 'Chi tiết đơn hàng.');
    }
}
