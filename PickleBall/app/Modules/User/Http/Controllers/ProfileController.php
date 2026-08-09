<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\User\Http\Requests\UpdateProfileRequest;
use App\Modules\User\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    use HasStandardResponse;

    public function show(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()), 'Lấy thông tin cá nhân thành công.');
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return $this->success(new UserResource($user->fresh()), 'Cập nhật thông tin thành công.');
    }
}
