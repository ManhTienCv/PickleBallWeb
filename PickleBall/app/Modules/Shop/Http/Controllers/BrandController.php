<?php

namespace App\Modules\Shop\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\Shop\Http\Resources\BrandResource;
use App\Modules\Shop\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    use HasStandardResponse;

    public function index(): JsonResponse
    {
        $brands = Brand::where('is_active', true)->get();

        return $this->success(BrandResource::collection($brands), 'Danh sách thương hiệu.');
    }
}
