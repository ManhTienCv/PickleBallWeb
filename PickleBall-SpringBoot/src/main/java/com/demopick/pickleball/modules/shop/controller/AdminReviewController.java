package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.shop.entity.Review;
import com.demopick.pickleball.modules.shop.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    private final ReviewRepository reviewRepository;

    public AdminReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Review>>> getReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String search
    ) {
        List<Review> list;
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            list = reviewRepository.findByStatusOrderByCreatedAtDesc(status.toLowerCase());
        } else {
            list = reviewRepository.findAllByOrderByCreatedAtDesc();
        }

        if (rating != null) {
            list = list.stream().filter(r -> Objects.equals(r.getRating(), rating)).toList();
        }
        if (search != null && !search.isBlank()) {
            String kw = search.trim().toLowerCase();
            list = list.stream().filter(r -> 
                    (r.getUserName() != null && r.getUserName().toLowerCase().contains(kw)) ||
                    (r.getComment() != null && r.getComment().toLowerCase().contains(kw))
            ).toList();
        }

        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách đánh giá thành công."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Review>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review != null) {
            String newStatus = payload.get("status");
            if (newStatus != null && !newStatus.isBlank()) {
                review.setStatus(newStatus.toLowerCase());
                review = reviewRepository.save(review);
            }
            return ResponseEntity.ok(ApiResponse.success(review, "Cập nhật trạng thái đánh giá thành công."));
        }
        return ResponseEntity.notFound().build();
    }
}
