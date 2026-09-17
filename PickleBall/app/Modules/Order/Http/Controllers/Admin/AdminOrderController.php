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

    public function cancelOrder(Request $request, string $code): JsonResponse
    {
        $reason = $request->input('reason', 'Admin hủy đơn hàng');

        $order = Order::where('order_code', $code)->first();

        if ($order) {
            $currentStatus = strtolower($order->status);
            $lockedStatuses = ['shipping', 'delivering', 'delivered', 'shipped'];

            if (in_array($currentStatus, $lockedStatuses)) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'ORDER_LOCKED_CANNOT_CANCEL',
                    'message' => "Không thể hủy đơn hàng #{$code} vì kiện hàng đã được giao cho đơn vị vận chuyển (GHN Express).",
                ], 422);
            }

            $order->status = 'cancelled';
            $order->save();
        }

        // Đồng bộ cả trong Cache
        $orders = \Illuminate\Support\Facades\Cache::get('demopick_orders_store', []);
        if (isset($orders[$code])) {
            $orders[$code]['status'] = 'cancelled';
            $orders[$code]['cancel_reason'] = $reason;
            \Illuminate\Support\Facades\Cache::put('demopick_orders_store', $orders, 86400 * 30);
        }

        return $this->success([
            'order_code' => $code,
            'status' => 'cancelled',
            'cancel_reason' => $reason,
        ], "Đã hủy đơn hàng #{$code} thành công.");
    }
}
