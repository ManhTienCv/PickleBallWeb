package com.demopick.pickleball.modules.user.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.user.dto.AuthResponse;
import com.demopick.pickleball.modules.user.dto.LoginRequest;
import com.demopick.pickleball.modules.user.dto.RegisterRequest;
import com.demopick.pickleball.modules.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final com.demopick.pickleball.common.service.EmailService emailService;

    public AuthController(AuthService authService,
                          com.demopick.pickleball.common.service.EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }

    @GetMapping("/test-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testEmail(
            @RequestParam(required = false, defaultValue = "nvmtein@gmail.com") String to) {
        boolean sent = emailService.sendTestEmail(to);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("recipient", to);
        result.put("sent", sent);
        result.put("smtpHost", "smtp.gmail.com");
        result.put("port", 587);
        result.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success(result, sent ? "Email kiểm thử đã được gửi thành công!" : "Gửi email thất bại hoặc chuyển sang mô phỏng."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        String ipAddress = servletRequest != null ? servletRequest.getRemoteAddr() : null;
        String userAgent = servletRequest != null ? servletRequest.getHeader("User-Agent") : null;
        Map<String, Object> result = authService.login(request, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success(result, "Đăng nhập thành công."));
    }

    @PostMapping("/register/send-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendRegisterOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        Map<String, Object> result = authService.sendRegisterOtp(email, name);
        return ResponseEntity.ok(ApiResponse.success(result, "Mã OTP xác thực đăng ký đã được gửi tới email."));
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyRegisterOtp(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(request);
        return ResponseEntity.status(201).body(ApiResponse.success(result, "Xác thực OTP và đăng ký tài khoản thành công."));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(request);
        return ResponseEntity.status(201).body(ApiResponse.success(result, "Đăng ký tài khoản thành công."));
    }

    @PostMapping("/login/send-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendLoginOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> result = authService.sendLoginOtp(email);
        return ResponseEntity.ok(ApiResponse.success(result, "Mã OTP đăng nhập đã được gửi tới email."));
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyLoginOtp(
            @RequestBody Map<String, String> request,
            jakarta.servlet.http.HttpServletRequest servletRequest) {
        String email = request.get("email");
        String otp = request.get("otp");
        String ipAddress = servletRequest != null ? servletRequest.getRemoteAddr() : null;
        String userAgent = servletRequest != null ? servletRequest.getHeader("User-Agent") : null;
        Map<String, Object> result = authService.loginWithOtp(email, otp, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success(result, "Đăng nhập bằng mã OTP thành công."));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<Map<String, Object>>> googleLogin(@RequestBody com.demopick.pickleball.modules.user.dto.GoogleAuthRequest request) {
        Map<String, Object> result = authService.googleLogin(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Đăng nhập với Google thành công."));
    }

    @PostMapping("/check-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> result = authService.checkEmail(email);
        return ResponseEntity.ok(ApiResponse.success(result, "Kiểm tra email thành công."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Map<String, Object> result = authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success(result, "Mã xác thực đã được tạo thành công."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        authService.resetPassword(email, otp, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Đặt lại mật khẩu thành công."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Chưa xác thực.", null));
        }
        Long userId = (Long) authentication.getPrincipal();
        AuthResponse profile = authService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Lấy thông tin thành công."));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success(null, "Đăng xuất thành công."));
    }
}
