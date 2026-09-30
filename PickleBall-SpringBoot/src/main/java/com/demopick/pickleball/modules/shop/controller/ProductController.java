package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.shop.entity.Product;
import com.demopick.pickleball.modules.shop.entity.Review;
import com.demopick.pickleball.modules.shop.repository.ReviewRepository;
import com.demopick.pickleball.modules.shop.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ShopService shopService;
    private final ReviewRepository reviewRepository;

    public ProductController(ShopService shopService, ReviewRepository reviewRepository) {
        this.shopService = shopService;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getProducts(@RequestParam(required = false) Long categoryId) {
        List<Product> products = shopService.getProducts(categoryId);
        return ResponseEntity.ok(ApiResponse.success(products, "Lấy danh sách sản phẩm thành công."));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<Product>> getProductBySlug(@PathVariable String slug) {
        Product product = shopService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product, "Lấy thông tin sản phẩm thành công."));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductReviews(@PathVariable Long id) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(id);
        double avg = reviews.isEmpty() ? 5.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);

        Map<String, Object> data = new HashMap<>();
        data.put("reviews", reviews);
        data.put("average_rating", Math.round(avg * 10.0) / 10.0);
        data.put("total_reviews", reviews.size());

        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách đánh giá sản phẩm thành công."));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<Review>> addReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        Review review = new Review();
        review.setProductId(id);
        if (payload.containsKey("rating")) {
            review.setRating(Integer.parseInt(String.valueOf(payload.get("rating"))));
        }
        if (payload.containsKey("comment")) {
            review.setComment(String.valueOf(payload.get("comment")));
        }
        if (payload.containsKey("user_name")) {
            review.setUserName(String.valueOf(payload.get("user_name")));
        }
        if (payload.containsKey("variant_purchased")) {
            review.setVariantPurchased(String.valueOf(payload.get("variant_purchased")));
        }
        if (payload.containsKey("images") && payload.get("images") != null) {
            review.setImages(String.valueOf(payload.get("images")));
        }
        review.setStatus("approved");

        review = reviewRepository.save(review);
        return ResponseEntity.ok(ApiResponse.success(review, "Gửi đánh giá sản phẩm thành công."));
    }
}
