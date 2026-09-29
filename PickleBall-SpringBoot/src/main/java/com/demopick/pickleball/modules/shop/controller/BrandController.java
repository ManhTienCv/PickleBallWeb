package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.shop.entity.Brand;
import com.demopick.pickleball.modules.shop.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
public class BrandController {

    private final ShopService shopService;

    public BrandController(ShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Brand>>> getBrands() {
        List<Brand> brands = shopService.getBrands();
        return ResponseEntity.ok(ApiResponse.success(brands, "Lấy danh sách thương hiệu thành công."));
    }
}
