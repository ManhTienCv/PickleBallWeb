package com.demopick.pickleball.modules.order.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.order.dto.CheckoutRequest;
import com.demopick.pickleball.modules.order.dto.CheckoutResponse;
import com.demopick.pickleball.modules.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/checkout")
public class CheckoutController {

    private final OrderService orderService;

    public CheckoutController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @RequestBody CheckoutRequest request,
            Authentication authentication
    ) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            userId = (Long) authentication.getPrincipal();
        }

        CheckoutResponse response = orderService.checkout(request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Khởi tạo đơn hàng thành công."));
    }
}
