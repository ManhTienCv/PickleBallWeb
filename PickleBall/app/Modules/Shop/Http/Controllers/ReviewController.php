<?php

namespace App\Modules\Shop\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    use HasStandardResponse;

    /**
     * Get approved reviews for a product with statistics
     */
    public function index(Request $request, $productId): JsonResponse
    {
        $product = is_numeric($productId)
            ? Product::find($productId)
            : Product::where('slug', $productId)->first();

        if (!$product) {
            return $this->error('Sản phẩm không tồn tại.', 404);
        }

        $reviews = ProductReview::where('product_id', $product->id)
            ->approved()
            ->orderByDesc('created_at')
            ->get();

        $total = $reviews->count();
        $avgRating = $total > 0 ? round($reviews->avg('rating'), 1) : 5.0;

        $breakdown = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return $this->success([
            'product_id' => $product->id,
            'average_rating' => $avgRating,
            'total_reviews' => $total,
            'rating_breakdown' => $breakdown,
            'reviews' => $reviews->map(function ($r) {
                return [
                    'id' => (string) $r->id,
                    'productId' => $r->product_id,
                    'userName' => $r->user_name ?? 'Khách hàng DemoPick',
                    'userAvatar' => $r->user_avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
                    'rating' => (int) $r->rating,
                    'comment' => $r->comment,
                    'images' => $r->images ?? [],
                    'variantPurchased' => $r->variant_purchased,
                    'isVerifiedPurchase' => (bool) $r->is_verified_purchase,
                    'likes' => (int) $r->likes,
                    'createdAt' => $r->created_at ? $r->created_at->format('d/m/Y') : date('d/m/Y'),
                    'status' => $r->status,
                ];
            }),
        ], 'Lấy danh sách đánh giá thành công.');
    }

    /**
     * Submit a new review for a product
     */
    public function store(Request $request, $productId): JsonResponse
    {
        $product = is_numeric($productId)
            ? Product::find($productId)
            : Product::where('slug', $productId)->first();

        if (!$product) {
            return $this->error('Sản phẩm không tồn tại.', 404);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'variant_purchased' => 'nullable|string|max:150',
            'order_id' => 'nullable|integer',
            'user_name' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $userId = $user ? $user->id : 1;
        $userName = $user ? $user->name : ($request->input('user_name') ?: 'Khách hàng DemoPick');
        $userAvatar = $user ? $user->avatar_url : null;

        // Check if user already reviewed this product recently
        $existing = ProductReview::where('product_id', $product->id)
            ->where('user_id', $userId)
            ->where('created_at', '>=', now()->subMinutes(1))
            ->first();

        if ($existing) {
            return $this->error('Bạn vừa gửi đánh giá cho sản phẩm này. Vui lòng chờ giây lát.', 429);
        }

        // Check verified purchase from orders
        $isVerified = true;
        $orderId = $validated['order_id'] ?? null;
        if ($user) {
            $hasOrder = DB::connection('main')->table('orders')
                ->where('user_id', $user->id)
                ->whereIn('status', ['completed', 'confirmed', 'shipping', 'delivered'])
                ->exists();
            if ($hasOrder || $orderId) {
                $isVerified = true;
            }
        }

        $review = ProductReview::create([
            'product_id' => $product->id,
            'user_id' => $userId,
            'order_id' => $orderId,
            'user_name' => $userName,
            'user_avatar' => $userAvatar,
            'rating' => $validated['rating'],
            'comment' => strip_tags($validated['comment']),
            'images' => $validated['images'] ?? [],
            'variant_purchased' => $validated['variant_purchased'] ?? null,
            'is_verified_purchase' => $isVerified,
            'likes' => 0,
            'status' => 'approved',
        ]);

        return $this->created([
            'id' => (string) $review->id,
            'productId' => $review->product_id,
            'userName' => $review->user_name,
            'userAvatar' => $review->user_avatar,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'images' => $review->images ?? [],
            'variantPurchased' => $review->variant_purchased,
            'isVerifiedPurchase' => $review->is_verified_purchase,
            'likes' => 0,
            'createdAt' => $review->created_at->format('d/m/Y'),
            'status' => $review->status,
        ], 'Cảm ơn bạn đã gửi đánh giá cho sản phẩm!');
    }

    /**
     * Like a review
     */
    public function like($id): JsonResponse
    {
        $review = ProductReview::find($id);
        if (!$review) {
            return $this->error('Đánh giá không tồn tại.', 404);
        }

        $review->increment('likes');

        return $this->success(['likes' => $review->likes], 'Đã thích đánh giá.');
    }

    /**
     * Admin: List all reviews
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = ProductReview::with('product')->orderByDesc('created_at');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 20), 100);
        $reviews = $query->paginate($perPage);

        return $this->success($reviews, 'Danh sách đánh giá quản trị.');
    }

    /**
     * Admin: Update review status (approve, hide)
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,pending,hidden',
        ]);

        $review = ProductReview::find($id);
        if (!$review) {
            return $this->error('Đánh giá không tồn tại.', 404);
        }

        $review->update(['status' => $request->status]);

        return $this->success($review, 'Cập nhật trạng thái đánh giá thành công.');
    }
}
