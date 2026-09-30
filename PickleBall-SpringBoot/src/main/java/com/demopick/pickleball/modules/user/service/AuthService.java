package com.demopick.pickleball.modules.user.service;

import com.demopick.pickleball.common.exception.ApiException;
import com.demopick.pickleball.modules.user.dto.AuthResponse;
import com.demopick.pickleball.modules.user.dto.GoogleAuthRequest;
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
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private static final Map<String, String> RESET_OTP_CACHE = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public Map<String, Object> login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = userRepository.findByEmail(email.toLowerCase())
                .or(() -> userRepository.findByEmail(email))
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
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(email) || userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email đã tồn tại trên hệ thống.", HttpStatus.UNPROCESSABLE_ENTITY);
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus("active");
        user.setRole(user.getRole());

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", AuthResponse.fromUser(user));
        return result;
    }

    public Map<String, Object> googleLogin(GoogleAuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ApiException("Email Google không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByEmail(request.getEmail().trim()))
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(request.getName() != null && !request.getName().isBlank() ? request.getName().trim() : "Người dùng Google");
                    newUser.setPhone(request.getPhone());
                    newUser.setAvatarUrl(request.getPicture());
                    newUser.setGoogleId(request.getGoogleId());
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setStatus("active");
                    return userRepository.save(newUser);
                });

        boolean updated = false;
        if (user.getGoogleId() == null && request.getGoogleId() != null) {
            user.setGoogleId(request.getGoogleId());
            updated = true;
        }
        if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && request.getPicture() != null) {
            user.setAvatarUrl(request.getPicture());
            updated = true;
        }
        if (updated) {
            user = userRepository.save(user);
        }

        String role = user.getRole();
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), role);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", AuthResponse.fromUser(user));
        return result;
    }

    public Map<String, Object> checkEmail(String email) {
        Map<String, Object> result = new HashMap<>();
        if (email == null || email.isBlank()) {
            result.put("exists", false);
            return result;
        }
        String cleanEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(email.trim()));
        if (userOpt.isPresent()) {
            result.put("exists", true);
            result.put("name", userOpt.get().getName());
        } else {
            result.put("exists", false);
        }
        return result;
    }

    public Map<String, Object> forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new ApiException("Vui lòng cung cấp địa chỉ email.", HttpStatus.BAD_REQUEST);
        }
        String cleanEmail = email.trim().toLowerCase();
        String otp = String.format("%06d", (int) (Math.random() * 900000) + 100000);
        RESET_OTP_CACHE.put(cleanEmail, otp);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Mã xác thực OTP đã được gửi tới " + cleanEmail);
        res.put("demoOtp", otp);
        return res;
    }

    public void resetPassword(String email, String otp, String newPassword) {
        if (email == null || otp == null || newPassword == null || newPassword.isBlank()) {
            throw new ApiException("Thông tin đặt lại mật khẩu không hợp lệ.", HttpStatus.BAD_REQUEST);
        }
        String cleanEmail = email.trim().toLowerCase();
        String cachedOtp = RESET_OTP_CACHE.get(cleanEmail);
        if (cachedOtp == null || !cachedOtp.equals(otp.trim())) {
            throw new ApiException("Mã OTP không chính xác hoặc đã hết hạn.", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(email.trim()))
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng.", HttpStatus.NOT_FOUND));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        RESET_OTP_CACHE.remove(cleanEmail);
    }

    public AuthResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng.", HttpStatus.NOT_FOUND));
        return AuthResponse.fromUser(user);
    }
}
