package com.demopick.pickleball.modules.user.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.user.entity.User;
import com.demopick.pickleball.modules.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAdminUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone() != null ? u.getPhone() : "");
            map.put("role", u.getRole() != null ? u.getRole() : "customer");
            map.put("status", u.getStatus() != null ? u.getStatus() : "active");
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "Vừa xong");
            map.put("lastLogin", "Hôm nay");
            map.put("ordersCount", 0);
            map.put("totalSpent", 0);
            map.put("courtBookingsCount", 0);
            result.add(map);
        }

        return ResponseEntity.ok(ApiResponse.success(result, "Lấy danh sách người dùng quản trị thành công."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        if (payload.containsKey("name")) user.setName((String) payload.get("name"));
        if (payload.containsKey("phone")) user.setPhone((String) payload.get("phone"));
        if (payload.containsKey("role")) user.setRole((String) payload.get("role"));
        if (payload.containsKey("status")) user.setStatus((String) payload.get("status"));

        userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());
        res.put("role", user.getRole());
        res.put("status", user.getStatus());

        return ResponseEntity.ok(ApiResponse.success(res, "Cập nhật tài khoản người dùng thành công."));
    }
}
