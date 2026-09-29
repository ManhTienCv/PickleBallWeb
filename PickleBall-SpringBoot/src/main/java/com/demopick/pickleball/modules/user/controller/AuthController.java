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

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Đăng nhập thành công."));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(request);
        return ResponseEntity.status(201).body(ApiResponse.success(result, "Đăng ký tài khoản thành công."));
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
