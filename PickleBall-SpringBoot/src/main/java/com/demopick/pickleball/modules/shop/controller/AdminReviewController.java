package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    private static final List<Map<String, Object>> REVIEWS = Collections.synchronizedList(new ArrayList<>());

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
