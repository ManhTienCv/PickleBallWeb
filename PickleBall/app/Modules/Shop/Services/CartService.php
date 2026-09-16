<?php

namespace App\Modules\Shop\Services;

use App\Modules\Shared\Exceptions\InsufficientStockException;
use App\Modules\Shop\Models\Cart;
use App\Modules\Shop\Models\CartItem;
use App\Modules\Shop\Models\ProductVariant;

class CartService
{
    public function getOrCreateCart(?int $userId, ?string $sessionId = null): Cart
    {
        if ($userId) {
            $cart = Cart::firstOrCreate(
                ['user_id' => $userId],
                ['expires_at' => now()->addDays(7)]
            );

            // If user had items in a guest session before logging in, transfer them to their account cart
            if ($sessionId) {
                $guestCart = Cart::where('session_id', $sessionId)
                    ->where(function ($query) use ($userId) {
                        $query->whereNull('user_id')->orWhere('user_id', '!=', $userId);
                    })
                    ->first();

                if ($guestCart && $guestCart->id !== $cart->id) {
                    foreach ($guestCart->items as $guestItem) {
                        $existing = CartItem::where('cart_id', $cart->id)
                            ->where('item_type', $guestItem->item_type)
                            ->where('variant_id', $guestItem->variant_id)
                            ->first();

                        if ($existing) {
                            $existing->update([
                                'quantity' => $existing->quantity + $guestItem->quantity,
                            ]);
                            $guestItem->delete();
                        } else {
                            $guestItem->update(['cart_id' => $cart->id]);
                        }
                    }
                    $guestCart->delete();
                }
            }
        } else {
            $cart = Cart::firstOrCreate(
                ['session_id' => $sessionId],
                ['expires_at' => now()->addDays(7)]
            );
        }

        $cart->load('items.variant.product');

        return $cart;
    }

    public function addItem(Cart $cart, array $data): CartItem
    {
        if ($data['item_type'] === 'product') {
            $variantId = $data['variant_id'] ?? $data['product_variant_id'] ?? null;
            $variant = ProductVariant::with('product')->find($variantId);
            if (!$variant && $variantId) {
                $variant = ProductVariant::with('product')->where('product_id', $variantId)->first();
            }
            if (!$variant && $variantId) {
                $prod = \App\Modules\Shop\Models\Product::find($variantId);
                if ($prod) {
                    $variant = ProductVariant::firstOrCreate(
                        ['product_id' => $prod->id, 'sku' => 'SKU-' . $prod->id . '-DEF'],
                        [
                            'color' => 'Mặc định',
                            'weight' => 'Tiêu chuẩn',
                            'stock_qty' => 50,
                            'status' => 'active',
                        ]
                    );
                    $variant->load('product');
                }
            }

            if (!$variant) {
                throw new \Exception("Không tìm thấy thông tin sản phẩm hoặc biến thể để thêm vào giỏ.");
            }

            if ($variant->available_stock < $data['quantity']) {
                throw new InsufficientStockException("Sản phẩm {$variant->product->name} (SKU: {$variant->sku}) không đủ số lượng tồn kho.");
            }

            $price = $variant->effective_price;

            $item = CartItem::where('cart_id', $cart->id)
                ->where('item_type', 'product')
                ->where('variant_id', $variant->id)
                ->first();

            if ($item) {
                $newQty = $item->quantity + $data['quantity'];
                if ($variant->available_stock < $newQty) {
                    throw new InsufficientStockException("Số lượng trong giỏ ({$newQty}) vượt quá tồn kho khả dụng ({$variant->available_stock}).");
                }
                $item->update([
                    'quantity' => $newQty,
                    'unit_price' => $price,
                ]);

                return $item->fresh('variant');
            }

            return CartItem::create([
                'cart_id' => $cart->id,
                'item_type' => 'product',
                'variant_id' => $variant->id,
                'quantity' => $data['quantity'],
                'unit_price' => $price,
                'metadata' => [
                    'product_name' => $variant->product->name,
                    'color' => $variant->color,
                    'weight' => $variant->weight,
                    'sku' => $variant->sku,
                ],
            ]);
        } else {
            // booking_slot item
            $item = CartItem::where('cart_id', $cart->id)
                ->where('item_type', 'booking_slot')
                ->where('slot_id', $data['slot_id'])
                ->first();

            if ($item) {
                return $item;
            }

            return CartItem::create([
                'cart_id' => $cart->id,
                'item_type' => 'booking_slot',
                'slot_id' => $data['slot_id'],
                'quantity' => 1,
                'unit_price' => $data['unit_price'] ?? 0,
                'metadata' => $data['metadata'] ?? [],
            ]);
        }
    }

    public function updateItem(CartItem $item, int $quantity): CartItem
    {
        if ($item->item_type === 'product' && $item->variant_id) {
            $variant = ProductVariant::with('product')->findOrFail($item->variant_id);
            if ($variant->available_stock < $quantity) {
                throw new InsufficientStockException("Sản phẩm {$variant->product->name} chỉ còn {$variant->available_stock} sản phẩm.");
            }
        }

        $item->update(['quantity' => $quantity]);

        return $item->fresh();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }
}
