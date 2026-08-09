<?php

namespace App\Modules\Shop\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Http\Resources\ProductResource;
use App\Modules\Shop\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use HasStandardResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'brand', 'variants'])
            ->where('status', 'active');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $perPage = min((int) $request->input('per_page', 12), 50);
        $products = $query->latest()->paginate($perPage);

        return $this->success(
            ProductResource::collection($products->items()),
            'Lấy danh sách sản phẩm thành công.',
            200,
            [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        );
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'brand', 'variants'])
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        return $this->success(new ProductResource($product), 'Chi tiết sản phẩm.');
    }
}
