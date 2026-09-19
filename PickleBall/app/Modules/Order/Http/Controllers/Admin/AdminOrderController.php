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

    /**
     * Admin xác nhận hoàn tiền cho đơn hàng Online đang ở trạng thái refund_pending
     */
    public function confirmRefund(Request $request, string $code): JsonResponse
    {
        $validated = $request->validate([
            'refund_trans_id' => 'nullable|string|max:100',
            'refund_note' => 'nullable|string|max:255',
        ]);

        $transId = $validated['refund_trans_id'] ?? ('REF_' . date('ymd') . rand(1000, 9999));
        $note = $validated['refund_note'] ?? 'Quản trị viên đã xác nhận chuyển khoản hoàn tiền cho khách.';

        $order = Order::where('order_code', $code)->first();
        if ($order) {
            $order->status = 'refunded';
            $order->payment_status = 'refunded';
            $order->save();
        }

        // Cập nhật Database trực tiếp qua bảng orders
        try {
            \Illuminate\Support\Facades\DB::connection('main')->table('orders')->where('order_code', $code)->update([
                'status' => 'refunded',
                'payment_status' => 'refunded',
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::info('Admin confirmRefund DB note: ' . $e->getMessage());
        }

        // Đồng bộ trong Cache
        $orders = \Illuminate\Support\Facades\Cache::get('demopick_orders_store', []);
        if (isset($orders[$code])) {
            $orders[$code]['status'] = 'refunded';
            $orders[$code]['payment_status'] = 'refunded';
            $orders[$code]['refund_status'] = 'completed';
            $orders[$code]['refund_trans_id'] = $transId;
            $orders[$code]['refund_note'] = $note;
            $orders[$code]['refunded_at'] = now()->toIso8601String();
            \Illuminate\Support\Facades\Cache::put('demopick_orders_store', $orders, 86400 * 30);
        }

        // Đánh dấu đã giải quyết thông báo refund_request trong Cache Admin
        try {
            $notifs = \Illuminate\Support\Facades\Cache::get('demopick_admin_notifications', []);
            if (is_array($notifs)) {
                foreach ($notifs as &$n) {
                    if (($n['order_code'] ?? '') === $code && ($n['type'] ?? '') === 'refund_request') {
                        $n['is_read'] = true;
                        $n['resolved'] = true;
                    }
                }
                \Illuminate\Support\Facades\Cache::put('demopick_admin_notifications', $notifs, 86400 * 30);
            }
        } catch (\Throwable $e) {
            // ignore notification update errors
        }

        return $this->success([
            'order_code' => $code,
            'status' => 'refunded',
            'payment_status' => 'refunded',
            'refund_trans_id' => $transId,
            'refund_note' => $note,
            'refunded_at' => now()->toIso8601String(),
        ], "Đã xác nhận hoàn tiền thành công cho đơn hàng #{$code}.");
    }
}
