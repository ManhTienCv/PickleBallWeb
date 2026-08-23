<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Shared\Enums\UserRole;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\User\Http\Requests\LoginRequest;
use App\Modules\User\Http\Requests\RegisterRequest;
use App\Modules\User\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use HasStandardResponse;

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => 'active',
        ]);

        $user->assignRole(UserRole::CUSTOMER->value);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->created([
            'token' => $token,
            'user' => new UserResource($user),
        ], 'Đăng ký tài khoản thành công.');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return $this->error('Email hoặc mật khẩu không chính xác.', 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if ($user->status !== 'active') {
            return $this->error('Tài khoản của bạn đã bị khóa hoặc tạm ngưng.', 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => new UserResource($user),
        ], 'Đăng nhập thành công.');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Đăng xuất thành công.');
    }
}
