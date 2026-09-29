package com.demopick.pickleball.modules.user.service;

import com.demopick.pickleball.common.exception.ApiException;
import com.demopick.pickleball.modules.user.dto.AuthResponse;
import com.demopick.pickleball.modules.user.dto.LoginRequest;
import com.demopick.pickleball.modules.user.dto.RegisterRequest;
import com.demopick.pickleball.modules.user.entity.User;
import com.demopick.pickleball.modules.user.repository.UserRepository;
import com.demopick.pickleball.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Email hoặc mật khẩu không chính xác.", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            if (!request.getPassword().equals(user.getPassword())) {
                throw new ApiException("Email hoặc mật khẩu không chính xác.", HttpStatus.UNAUTHORIZED);
            }
        }

        String role = user.getRole();
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), role);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", AuthResponse.fromUser(user));
        return result;
    }

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email đã tồn tại trên hệ thống.", HttpStatus.UNPROCESSABLE_ENTITY);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus("active");

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), "customer");

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", AuthResponse.fromUser(user));
        return result;
    }

    public AuthResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng.", HttpStatus.NOT_FOUND));
        return AuthResponse.fromUser(user);
    }
}
