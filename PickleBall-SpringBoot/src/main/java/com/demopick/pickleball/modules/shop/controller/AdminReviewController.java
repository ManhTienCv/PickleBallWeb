package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    private static final List<Map<String, Object>> REVIEWS = Collections.synchronizedList(new ArrayList<>());

    static {
        Map<String, Object> r1 = new HashMap<>();
        r1.put("id", 1L);
        r1.put("product_id", 1L);
        r1.put("user_id", 101L);
        r1.put("user_name", "Nguyễn Văn Tuấn");
        r1.put("rating", 5);
        r1.put("comment", "Vợt Joola Perseus Pro đánh bóng cực đầm tay, độ bám mặt vợt siêu đỉnh! Đóng gói rất chắc chắn, giao hàng nhanh.");
        r1.put("images", List.of("/images/pickleball_paddle_joola.jpg"));
        r1.put("variant_purchased", "16mm - Tay cầm dài");
        r1.put("is_verified_purchase", true);
        r1.put("likes", 18);
        r1.put("status", "approved");
        r1.put("created_at", "2026-08-15 14:32:00");
        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", 1L);
        p1.put("name", "Vợt Pickleball Joola Ben Johns Perseus CFS 16");
        p1.put("images", List.of("/images/pickleball_paddle_joola.jpg"));
        r1.put("product", p1);
        REVIEWS.add(r1);

        Map<String, Object> r2 = new HashMap<>();
        r2.put("id", 2L);
        r2.put("product_id", 2L);
        r2.put("user_id", 102L);
        r2.put("user_name", "Trần Minh Quang");
        r2.put("rating", 5);
        r2.put("comment", "Bóng Selkirk Pro S1 nảy đều, đường bay chuẩn USAPA. Đã mua 3 hộp chơi giao lưu cùng anh em trong CLB.");
        r2.put("images", List.of("/images/pickleball_balls.jpg"));
        r2.put("variant_purchased", "Hộp 12 quả");
        r2.put("is_verified_purchase", true);
        r2.put("likes", 9);
        r2.put("status", "approved");
        r2.put("created_at", "2026-08-18 10:15:00");
        Map<String, Object> p2 = new HashMap<>();
        p2.put("id", 2L);
        p2.put("name", "Hộp 12 Bóng Pickleball Selkirk Pro S1 Thi Đấu");
        p2.put("images", List.of("/images/pickleball_balls.jpg"));
        r2.put("product", p2);
        REVIEWS.add(r2);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String search
    ) {
        List<Map<String, Object>> filtered = new ArrayList<>(REVIEWS);
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            filtered = filtered.stream()
                    .filter(r -> status.equalsIgnoreCase(String.valueOf(r.get("status"))))
                    .toList();
        }
        if (rating != null) {
            filtered = filtered.stream()
                    .filter(r -> Objects.equals(r.get("rating"), rating))
                    .toList();
        }
        return ResponseEntity.ok(ApiResponse.success(filtered, "Lấy danh sách đánh giá thành công."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        String newStatus = payload.get("status");
        for (Map<String, Object> r : REVIEWS) {
            if (Objects.equals(r.get("id"), id)) {
                r.put("status", newStatus);
                return ResponseEntity.ok(ApiResponse.success(r, "Cập nhật trạng thái đánh giá thành công."));
            }
        }
        Map<String, Object> dummy = new HashMap<>();
        dummy.put("id", id);
        dummy.put("status", newStatus);
        return ResponseEntity.ok(ApiResponse.success(dummy, "Cập nhật thành công."));
    }
}
