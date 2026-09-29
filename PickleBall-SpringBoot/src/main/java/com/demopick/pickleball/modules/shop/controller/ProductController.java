package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.shop.entity.Product;
import com.demopick.pickleball.modules.shop.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ShopService shopService;

    public ProductController(ShopService shopService) {
        this.shopService = shopService;
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
}
