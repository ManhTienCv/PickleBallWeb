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

    public function __construct(protected CartService $cartService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);

        return $this->success(new CartResource($cart), 'Lấy thông tin giỏ hàng thành công.');
    }

    public function store(AddToCartRequest $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-Id') ?: $request->input('session_id');

        $cart = $this->cartService->getOrCreateCart($userId, $sessionId);
        $item = $this->cartService->addItem($cart, $request->validated());

        return $this->created(new CartItemResource($item), 'Đã thêm sản phẩm vào giỏ hàng.');
    }

    public function update(UpdateCartItemRequest $request, int $id): JsonResponse
    {
        $item = CartItem::findOrFail($id);
        $updatedItem = $this->cartService->updateItem($item, $request->validated()['quantity']);

        return $this->success(new CartItemResource($updatedItem), 'Đã cập nhật số lượng giỏ hàng.');
    }

    public function destroy(int $id): JsonResponse
    {
        $item = CartItem::findOrFail($id);
        $this->cartService->removeItem($item);

        return $this->success(null, 'Đã xoá mục khỏi giỏ hàng.');
    }
}
