<?php

namespace App\Modules\Shop\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Http\Resources\ProductResource;
use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    use HasStandardResponse;

    /**
     * Get user's wishlist products
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth('sanctum')->id() ?? 1;

        $items = WishlistItem::where('user_id', $userId)
            ->with(['product.category', 'product.brand', 'product.variants'])
            ->latest()
            ->get();

        $products = $items->map(function ($item) {
            return $item->product ? new ProductResource($item->product) : null;
        })->filter()->values();

        return $this->success([
            'count' => $products->count(),
            'products' => $products,
        ], 'Lấy danh sách yêu thích thành công.');
    }

    /**
     * Toggle product in user's wishlist
     */
    public function toggle(Request $request, $productId): JsonResponse
    {
        $userId = auth('sanctum')->id() ?? 1;

        $product = is_numeric($productId)
            ? Product::find($productId)
            : Product::where('slug', $productId)->first();

        if (!$product) {
            return $this->error('Sản phẩm không tồn tại.', 404);
        }

        $existing = WishlistItem::where('user_id', $userId)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $inWishlist = false;
            $message = "Đã xóa '{$product->name}' khỏi danh sách yêu thích.";
        } else {
            WishlistItem::create([
                'user_id' => $userId,
                'product_id' => $product->id,
            ]);
            $inWishlist = true;
            $message = "Đã lưu '{$product->name}' vào danh sách yêu thích!";
        }

        $count = WishlistItem::where('user_id', $userId)->count();

        return $this->success([
            'in_wishlist' => $inWishlist,
            'count' => $count,
            'product_id' => $product->id,
        ], $message);
    }

    /**
     * Remove product from wishlist
     */
    public function destroy(Request $request, $productId): JsonResponse
    {
        $userId = auth('sanctum')->id() ?? 1;

        $product = is_numeric($productId)
            ? Product::find($productId)
            : Product::where('slug', $productId)->first();

        if ($product) {
            WishlistItem::where('user_id', $userId)
                ->where('product_id', $product->id)
                ->delete();
        }

        $count = WishlistItem::where('user_id', $userId)->count();

        return $this->success(['count' => $count], 'Đã xóa sản phẩm khỏi danh sách yêu thích.');
    }
}
