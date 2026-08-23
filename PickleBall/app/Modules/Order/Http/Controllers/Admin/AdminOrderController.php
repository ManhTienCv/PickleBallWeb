<?php

namespace App\Modules\Order\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Order\Http\Resources\OrderResource;
use App\Modules\Order\Models\Order;
use App\Modules\Shared\Traits\HasStandardResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    use HasStandardResponse;

    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['items', 'payment'])->latest()->get();

        return $this->success(OrderResource::collection($orders), 'Danh sách tất cả hóa đơn admin.');
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,processing,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $validated['status'];
        if ($validated['status'] === 'completed') {
            $order->payment_status = 'paid';
        }
        $order->save();

        $order->load(['items', 'payment']);

        return $this->success(new OrderResource($order), 'Cập nhật trạng thái đơn hàng thành công.');
    }
}
