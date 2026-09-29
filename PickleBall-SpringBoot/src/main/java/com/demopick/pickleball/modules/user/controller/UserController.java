package com.demopick.pickleball.modules.user.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.user.dto.AuthResponse;
import com.demopick.pickleball.modules.user.entity.User;
import com.demopick.pickleball.modules.user.repository.UserRepository;
import com.demopick.pickleball.modules.user.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserRepository userRepository;
    private final AuthService authService;

    // Bộ nhớ đệm OTP tạm thời (5 phút)
    private static final Map<String, String> OTP_CACHE = new ConcurrentHashMap<>();

    public UserController(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> getProfile(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa xác thực danh tính.", null));
        }
        Long userId = (Long) authentication.getPrincipal();
        AuthResponse res = authService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(res, "Lấy thông tin tài khoản thành công."));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> payload
    ) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa xác thực danh tính.", null));
        }
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        if (payload.containsKey("name")) user.setName((String) payload.get("name"));
        if (payload.containsKey("phone")) user.setPhone((String) payload.get("phone"));
        if (payload.containsKey("avatar_url")) user.setAvatarUrl((String) payload.get("avatar_url"));

        userRepository.save(user);
        AuthResponse res = authService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(res, "Cập nhật hồ sơ thành công."));
    }

    @PostMapping("/email/send-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendEmailOtp(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng cung cấp địa chỉ email.", null));
        }

        // Tạo mã OTP 6 chữ số
        String otp = String.format("%06d", (int) (Math.random() * 900000) + 100000);
        OTP_CACHE.put(email.toLowerCase().trim(), otp);

        log.info("📧 [Email OTP] Đã gửi mã OTP {} tới địa chỉ {}", otp, email);

        Map<String, Object> data = new HashMap<>();
        data.put("email", email);
        data.put("message", "Mã xác thực OTP đã được tạo và gửi thành công.");
        data.put("debug_otp", otp); // Hỗ trợ test nhanh tại môi trường dev

        return ResponseEntity.ok(ApiResponse.success(data, "Mã xác thực OTP đã được gửi tới " + email));
    }

    @PostMapping("/email/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmailOtp(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa xác thực danh tính.", null));
        }
        Long userId = (Long) authentication.getPrincipal();
        String email = payload.get("email");
        String otp = payload.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Thiếu thông tin email hoặc mã OTP.", null));
        }

        String cachedOtp = OTP_CACHE.get(email.toLowerCase().trim());
        if (cachedOtp == null || !cachedOtp.equals(otp.trim())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã OTP không chính xác hoặc đã hết hạn.", null));
        }

        // Cập nhật email người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));
        user.setEmail(email.toLowerCase().trim());
        userRepository.save(user);

        OTP_CACHE.remove(email.toLowerCase().trim());
        AuthResponse res = authService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(res, "Xác thực email và cập nhật thành công."));
    }
}
