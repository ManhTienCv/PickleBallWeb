<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shared\Traits\HasStandardResponse;
use App\Modules\User\Http\Requests\UpdateProfileRequest;
use App\Modules\User\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

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

    /**
     * Gửi mã OTP xác thực tới địa chỉ email mới
     */
    public function sendEmailOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('main.users', 'email')->ignore($request->user()->id),
            ],
        ], [
            'email.required' => 'Vui lòng nhập địa chỉ email mới.',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
            'email.unique' => 'Địa chỉ email này đã được sử dụng bởi tài khoản khác.',
        ]);

        $user = $request->user();
        $newEmail = strtolower(trim($request->email));

        if ($newEmail === strtolower($user->email)) {
            return $this->error('Địa chỉ email mới phải khác với email hiện tại.', 422);
        }

        // Tạo mã OTP ngẫu nhiên 6 chữ số
        $otp = sprintf('%06d', mt_rand(100000, 999999));

        // Lưu vào Cache trong vòng 5 phút (300 giây)
        $cacheKey = 'email_otp_'.$user->id;
        Cache::put($cacheKey, [
            'email' => $newEmail,
            'otp' => $otp,
            'created_at' => now()->timestamp,
        ], now()->addMinutes(5));

        // Gửi email hoặc ghi log
        try {
            Mail::raw("Chào {$user->name},\n\nMã OTP xác thực thay đổi địa chỉ Email của bạn trên hệ thống DemoPick là: {$otp}\n\nMã xác thực này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\nTrân trọng,\nĐội ngũ DemoPick Web.", function ($message) use ($newEmail) {
                $message->to($newEmail)
                    ->subject('Mã xác thực OTP đổi địa chỉ Email - DemoPick');
            });
        } catch (\Throwable $e) {
            Log::warning('Không thể gửi mail OTP thực tế, ghi log: '.$e->getMessage());
        }

        Log::info("OTP đổi Email cho User #{$user->id} ({$newEmail}): {$otp}");

        return $this->success([
            'email' => $newEmail,
            'expires_in' => 300,
            'otp' => config('app.debug') ? $otp : null, // Trả về mã OTP khi debug để tiện test demo
        ], 'Mã xác thực OTP đã được gửi tới địa chỉ '.$newEmail);
    }

    /**
     * Xác thực mã OTP và cập nhật Email mới
     */
    public function verifyEmailOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ], [
            'email.required' => 'Vui lòng cung cấp email xác thực.',
            'otp.required' => 'Vui lòng nhập mã OTP 6 chữ số.',
            'otp.size' => 'Mã OTP phải bao gồm đúng 6 chữ số.',
        ]);

        $user = $request->user();
        $cacheKey = 'email_otp_'.$user->id;
        $cachedData = Cache::get($cacheKey);

        if (! $cachedData) {
            return $this->error('Mã OTP đã hết hạn hoặc chưa được tạo. Vui lòng yêu cầu gửi lại mã.', 422);
        }

        if (strtolower(trim($request->email)) !== strtolower($cachedData['email'])) {
            return $this->error('Địa chỉ email xác thực không khớp với email đã đăng ký nhận mã OTP.', 422);
        }

        if (trim($request->otp) !== strval($cachedData['otp'])) {
            return $this->error('Mã OTP không chính xác. Vui lòng kiểm tra lại.', 422);
        }

        // Cập nhật email mới vào database
        $user->email = $cachedData['email'];
        $user->save();

        // Xóa mã OTP khỏi cache sau khi dùng
        Cache::forget($cacheKey);

        Log::info("User #{$user->id} đã đổi Email thành công sang {$user->email}");

        return $this->success(new UserResource($user->fresh()), 'Đã thay đổi địa chỉ Email thành công!');
    }
}
