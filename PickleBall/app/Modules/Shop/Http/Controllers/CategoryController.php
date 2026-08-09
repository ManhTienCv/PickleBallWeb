<?php

namespace App\Modules\Shop\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Http\Resources\CategoryResource;
use App\Modules\Shop\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    use HasStandardResponse;

    public function index(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return $this->success(CategoryResource::collection($categories), 'Danh sách danh mục.');
    }
}
