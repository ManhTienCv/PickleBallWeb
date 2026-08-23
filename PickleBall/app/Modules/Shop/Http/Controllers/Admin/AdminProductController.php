<?php

namespace App\Modules\Shop\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Http\Resources\ProductResource;
use App\Modules\Shop\Models\InventoryTransaction;
use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    use HasStandardResponse;

    public function index(Request $request): JsonResponse
    {
        $products = Product::with(['category', 'brand', 'variants'])->latest()->get();

        return $this->success(ProductResource::collection($products), 'Danh sách sản phẩm admin.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_name' => 'nullable|string',
            'category_id' => 'nullable|integer',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'sku' => 'nullable|string',
            'stock_quantity' => 'nullable|integer|min:0',
            'item_type' => 'nullable|string',
            'specs' => 'nullable|array',
        ]);

        $slug = Str::slug($validated['name']).'-'.Str::random(4);

        $product = Product::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'base_price' => $validated['price'],
            'category_id' => $validated['category_id'] ?? 1,
            'short_description' => $validated['short_description'] ?? ($validated['name'].' - Hàng chính hãng'),
            'description' => $validated['description'] ?? ($validated['name'].' - Phục vụ tại quầy POS & Web'),
            'images' => [$validated['image_url'] ?? 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'],
            'status' => 'active',
            'specifications' => $validated['specs'] ?? [],
        ]);

        $initialStock = (int) ($validated['stock_quantity'] ?? 10);
        $sku = $validated['sku'] ?? ('SKU-'.strtoupper(Str::random(6)));

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => $sku,
            'color' => 'Mặc định',
            'weight' => 'Tiêu chuẩn',
            'stock_qty' => $initialStock,
            'status' => 'active',
        ]);

        if ($initialStock > 0) {
            InventoryTransaction::create([
                'variant_id' => $variant->id,
                'type' => 'in',
                'quantity' => $initialStock,
                'notes' => 'Khởi tạo tồn kho ban đầu khi tạo sản phẩm admin',
            ]);
        }

        $product->load(['category', 'brand', 'variants']);

        return $this->success(new ProductResource($product), 'Thêm sản phẩm mới thành công.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        if (isset($validated['name'])) {
            $product->name = $validated['name'];
        }
        if (isset($validated['price'])) {
            $product->base_price = $validated['price'];
        }
        if (isset($validated['description'])) {
            $product->description = $validated['description'];
        }
        if (isset($validated['short_description'])) {
            $product->short_description = $validated['short_description'];
        }
        if (isset($validated['image_url'])) {
            $product->images = [$validated['image_url']];
        }
        if (isset($validated['status'])) {
            $product->status = $validated['status'];
        }

        $product->save();
        $product->load(['category', 'brand', 'variants']);

        return $this->success(new ProductResource($product), 'Cập nhật sản phẩm thành công.');
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->status = 'inactive';
        $product->save();

        return $this->success(null, 'Đã ẩn sản phẩm khỏi hệ thống.');
    }

    public function adjustStock(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'change_qty' => 'required|integer',
            'type' => 'required|string|in:in,out,adjust',
            'notes' => 'nullable|string',
        ]);

        $product = Product::with('variants')->findOrFail($id);
        $variant = $product->variants->first();

        if (! $variant) {
            return $this->error('Sản phẩm không có biến thể tồn kho.', 400);
        }

        $changeQty = (int) $validated['change_qty'];
        if ($validated['type'] === 'out' && $changeQty > 0) {
            $changeQty = -$changeQty;
        }

        $newQty = max(0, $variant->stock_qty + $changeQty);
        $variant->stock_qty = $newQty;
        $variant->save();

        InventoryTransaction::create([
            'variant_id' => $variant->id,
            'type' => $validated['type'],
            'quantity' => abs($changeQty),
            'notes' => $validated['notes'] ?? 'Cập nhật kho từ Admin Dashboard',
        ]);

        $product->load(['category', 'brand', 'variants']);

        return $this->success(new ProductResource($product), 'Cập nhật tồn kho thành công.');
    }
}
