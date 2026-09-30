package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.shop.entity.Product;
import com.demopick.pickleball.modules.shop.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final ProductRepository productRepository;
    private final Map<String, Set<Long>> userWishlists = new ConcurrentHashMap<>();

    public WishlistController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    private String getWishlistKey(Authentication authentication, String sessionId) {
        if (authentication != null && authentication.getPrincipal() instanceof Long userId) {
            return "user_" + userId;
        }
        if (sessionId != null && !sessionId.isBlank()) {
            return "session_" + sessionId;
        }
        return "guest_default";
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWishlist(
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String key = getWishlistKey(authentication, sessionId);
        Set<Long> productIds = userWishlists.getOrDefault(key, Collections.emptySet());

        List<Product> products = new ArrayList<>();
        if (!productIds.isEmpty()) {
            products = productRepository.findAllById(productIds);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("count", products.size());
        data.put("products", products);

        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách yêu thích thành công."));
    }

    @PostMapping("/{productId}/toggle")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWishlist(
            @PathVariable Long productId,
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String key = getWishlistKey(authentication, sessionId);
        Set<Long> set = userWishlists.computeIfAbsent(key, k -> new CopyOnWriteArraySet<>());

        boolean inWishlist;
        if (set.contains(productId)) {
            set.remove(productId);
            inWishlist = false;
        } else {
            set.add(productId);
            inWishlist = true;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("product_id", productId);
        data.put("in_wishlist", inWishlist);
        data.put("count", set.size());

        String msg = inWishlist ? "Đã thêm sản phẩm vào danh sách yêu thích." : "Đã xóa sản phẩm khỏi danh sách yêu thích.";
        return ResponseEntity.ok(ApiResponse.success(data, msg));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String key = getWishlistKey(authentication, sessionId);
        Set<Long> set = userWishlists.get(key);
        if (set != null) {
            set.remove(productId);
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa sản phẩm khỏi danh sách yêu thích."));
    }
}
