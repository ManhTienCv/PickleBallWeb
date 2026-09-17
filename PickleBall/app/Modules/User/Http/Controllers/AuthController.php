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

        $user = User::with('roles')->where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return $this->error('Email hoặc mật khẩu không chính xác.', 401);
        }

        if ($user->status !== 'active') {
            return $this->error('Tài khoản của bạn đã bị khóa hoặc tạm ngưng.', 403);
        }

        // Keep tokens table tidy and fast
        $user->tokens()->where('name', 'auth_token')->latest()->skip(5)->take(20)->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => new UserResource($user),
        ], 'Đăng nhập thành công.');
    }

    public function checkEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        return response()->json([
            'success' => true,
            'exists' => (bool) $user,
            'name' => $user?->name,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return $this->success(null, 'Đăng xuất thành công.');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        $email = strtolower(trim($request->input('email')));

        $otp = (string) random_int(100000, 999999);
        \Illuminate\Support\Facades\Cache::put("reset_otp_{$email}", $otp, 600);

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Mã OTP xác thực đặt lại mật khẩu của bạn là: {$otp}\n\nMã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.",
                function ($message) use ($email) {
                    $message->to($email)->subject('Mã OTP Đặt Lại Mật Khẩu - DemoPick Pickleball');
                }
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::info("Email OTP for {$email}: {$otp}. Mail error: " . $e->getMessage());
        }

        return $this->success([
            'email' => $email,
            'demoOtp' => config('app.debug') ? $otp : null,
        ], 'Nếu email tồn tại, mã OTP xác thực đã được gửi tới hòm thư của bạn.');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'newPassword' => 'required|string|min:6',
        ]);

        $email = strtolower(trim($request->input('email')));
        $otp = trim($request->input('otp'));
        $cachedOtp = \Illuminate\Support\Facades\Cache::get("reset_otp_{$email}");

        if (!$cachedOtp || !hash_equals((string) $cachedOtp, (string) $otp)) {
            return $this->error('Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại.', 400);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return $this->error('Không tìm thấy tài khoản với email này.', 404);
        }

        $user->password = Hash::make($request->input('newPassword'));
        $user->save();

        \Illuminate\Support\Facades\Cache::forget("reset_otp_{$email}");

        return $this->success(null, 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.');
    }

    public function googleAuth(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'access_token' => 'nullable|string',
            'accessToken' => 'nullable|string',
            'email' => 'nullable|email',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'googleId' => 'nullable|string',
            'picture' => 'nullable|string',
        ]);

        $accessToken = $request->input('access_token') ?? $request->input('accessToken');
        $email = null;
        $googleName = null;
        $googlePicture = null;
        $googleId = null;

        // 1. Bắt buộc và xác thực Access Token với Google API UserInfo endpoint
        if (empty($accessToken)) {
            return $this->error('Yêu cầu Google Access Token hợp lệ để xác thực phiên đăng nhập.', 401);
        }

        try {
            $googleResp = \Illuminate\Support\Facades\Http::timeout(6)
                ->withToken($accessToken)
                ->get('https://www.googleapis.com/oauth2/v3/userinfo');

            if (!$googleResp->successful()) {
                return $this->error('Mã truy cập Google Access Token không hợp lệ hoặc đã hết hạn.', 401);
            }

            $googleData = $googleResp->json();

            // Bắt buộc email_verified === true
            if (empty($googleData['email_verified'])) {
                return $this->error('Tài khoản Google chưa được xác thực email (email_verified is false).', 403);
            }

            $email = strtolower(trim($googleData['email'] ?? ''));
            $googleName = trim($googleData['name'] ?? '');
            $googlePicture = $googleData['picture'] ?? null;
            $googleId = $googleData['sub'] ?? null;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Google OAuth API call failed: ' . $e->getMessage());
            return $this->error('Không thể kết nối đến máy chủ Google OAuth để xác thực token.', 502);
        }

        if (empty($email)) {
            return $this->error('Thiếu thông tin địa chỉ email từ Google.', 422);
        }

        // Ưu tiên tên hiển thị tùy biến người dùng tự đặt khi đăng ký, nếu không dùng tên từ Google
        $customName = strip_tags(trim($request->input('name', '')));
        $displayName = !empty($customName) ? $customName : (!empty($googleName) ? $googleName : 'Khách hàng Google');
        $phone = $request->input('phone') ? trim($request->input('phone')) : null;

        // Security Gate: Disallow social login for administrative and staff accounts
        $existingUser = User::where('email', $email)->first();
        if ($existingUser && $existingUser->hasAnyRole([UserRole::ADMIN->value, UserRole::SUPER_ADMIN->value, UserRole::STAFF->value])) {
            return $this->error('Tài khoản quản trị viên và nhân viên phải đăng nhập trực tiếp bằng mật khẩu bảo mật.', 403);
        }

        // 2. Cơ chế Liên kết tài khoản thông minh (Account Linking & Auto-Register)
        $user = User::where(function ($query) use ($googleId, $email) {
            if (!empty($googleId)) {
                $query->where('google_id', $googleId);
            }
            $query->orWhere('email', $email);
        })->first();

        if (!$user) {
            // Trường hợp 2: Email chưa tồn tại -> Tạo người dùng mới với password = NULL
            $user = User::create([
                'email' => $email,
                'name' => $displayName,
                'phone' => $phone,
                'avatar_url' => $googlePicture,
                'google_id' => $googleId,
                'password' => null,
                'status' => 'active',
                'email_verified_at' => now(),
            ]);
        } else {
            // Trường hợp 1: Email đã tồn tại -> Liên kết google_id, cập nhật avatar và tên hiển thị nếu có
            if (!empty($googleId) && empty($user->google_id)) {
                $user->google_id = $googleId;
            }
            if (empty($user->avatar_url) && !empty($googlePicture)) {
                $user->avatar_url = $googlePicture;
            }
            if (!empty($customName) && $customName !== 'Khách hàng Google') {
                $user->name = $customName;
            }
            if (!empty($phone) && empty($user->phone)) {
                $user->phone = $phone;
            }
            $user->save();
        }

        if (!$user->hasAnyRole(UserRole::cases())) {
            $user->assignRole(UserRole::CUSTOMER->value);
        }

        $token = $user->createToken('google_auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user' => new UserResource($user),
        ], 'Đăng nhập bằng Google thành công.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()), 'Lấy thông tin tài khoản thành công.');
    }
}
