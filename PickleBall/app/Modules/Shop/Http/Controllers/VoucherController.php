<?php

namespace App\Modules\Shop\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Models\Voucher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    use HasStandardResponse;

    /**
     * Public: Get available active vouchers
     */
    public function index(): JsonResponse
    {
        $vouchers = Voucher::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereRaw('used_count < usage_limit');
            })
            ->orderBy('min_order_amount', 'asc')
            ->get();

        return $this->success($vouchers, 'Danh sách mã ưu đãi có hiệu lực.');
    }

    /**
     * Public: Validate and apply a voucher code
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
        ]);

        $code = strtoupper(trim($validated['code']));
        $orderAmount = (float) $validated['order_amount'];

        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher) {
            return $this->error('Mã giảm giá không tồn tại hoặc đã hết hạn.', 404);
        }

        if (!$voucher->is_active) {
            return $this->error('Mã giảm giá này hiện đang tạm khóa.', 422);
        }

        if ($voucher->start_date && now()->lt($voucher->start_date)) {
            return $this->error('Chương trình ưu đãi này chưa bắt đầu.', 422);
        }

        if ($voucher->end_date && now()->gt($voucher->end_date)) {
            return $this->error('Mã giảm giá đã hết hạn sử dụng.', 422);
        }

        if ($voucher->usage_limit !== null && $voucher->used_count >= $voucher->usage_limit) {
            return $this->error('Mã giảm giá đã đạt số lượt sử dụng tối đa.', 422);
        }

        if ($orderAmount < (float) $voucher->min_order_amount) {
            $formattedMin = number_format($voucher->min_order_amount, 0, ',', '.') . 'đ';
            return $this->error("Đơn hàng phải từ {$formattedMin} trở lên để áp dụng mã ưu đãi này.", 422);
        }

        $discount = $voucher->calculateDiscount($orderAmount);
        $finalAmount = max(0, $orderAmount - $discount);

        return $this->success([
            'valid' => true,
            'code' => $voucher->code,
            'title' => $voucher->title,
            'discount_type' => $voucher->discount_type,
            'discount_value' => (float) $voucher->discount_value,
            'discount_amount' => $discount,
            'final_amount' => $finalAmount,
            'message' => "Áp dụng thành công! Đã giảm " . number_format($discount, 0, ',', '.') . "đ.",
        ], 'Áp dụng mã giảm giá thành công.');
    }

    /**
     * Admin: List all vouchers
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Voucher::orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        return $this->success($query->paginate(20), 'Danh sách mã ưu đãi.');
    }

    /**
     * Admin: Create a new voucher
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:shop.vouchers,code',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $voucher = Voucher::create($validated);

        return $this->created($voucher, 'Tạo mã ưu đãi thành công.');
    }

    /**
     * Admin: Update voucher
     */
    public function update(Request $request, $id): JsonResponse
    {
        $voucher = Voucher::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:shop.vouchers,code,' . $id,
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:255',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $voucher->update($validated);

        return $this->success($voucher, 'Cập nhật mã ưu đãi thành công.');
    }

    /**
     * Admin: Delete voucher
     */
    public function destroy($id): JsonResponse
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return $this->success(null, 'Đã xóa mã ưu đãi.');
    }
}
