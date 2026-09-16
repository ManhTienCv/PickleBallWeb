<?php

namespace App\Modules\Shop\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Http\Requests\AddToCartRequest;
use App\Modules\Shop\Http\Requests\UpdateCartItemRequest;
use App\Modules\Shop\Http\Resources\CartItemResource;
use App\Modules\Shop\Http\Resources\CartResource;
use App\Modules\Shop\Models\CartItem;
use App\Modules\Shop\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use HasStandardResponse;

    public function __construct(protected CartService $cartService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $this->resolveSessionId($request);

        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);

        return $this->success(new CartResource($cart), 'Lấy thông tin giỏ hàng thành công.');
    }

    public function store(AddToCartRequest $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $this->resolveSessionId($request);

        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);
        $this->cartService->addItem($cart, $request->validated());

        return $this->created(new CartResource($cart->fresh('items.variant.product')), 'Đã thêm sản phẩm vào giỏ hàng.');
    }

    public function update(UpdateCartItemRequest $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $this->resolveSessionId($request);
        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);

        $item = CartItem::where('cart_id', $cart->id)
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('variant_id', $id);
            })
            ->first();

        if (!$item) {
            return $this->error('Không tìm thấy mục trong giỏ hàng của bạn.', 404);
        }

        $updatedItem = $this->cartService->updateItem($item, $request->validated()['quantity']);
        $updatedItem->load('variant.product');

        return $this->success(new CartItemResource($updatedItem), 'Đã cập nhật số lượng giỏ hàng.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $this->resolveSessionId($request);
        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);

        $item = CartItem::where('cart_id', $cart->id)
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('variant_id', $id);
            })
            ->first();

        if ($item) {
            $this->cartService->removeItem($item);
        }

        return $this->success(null, 'Đã xoá mục khỏi giỏ hàng.');
    }

    protected function resolveSessionId(Request $request): string
    {
        return $request->header('X-Session-Id')
            ?: (string) $request->input('session_id')
            ?: ('guest_' . substr(md5(($request->ip() ?? '127.0.0.1') . ($request->userAgent() ?? '')), 0, 16));
    }
}
