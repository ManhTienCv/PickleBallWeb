package com.demopick.pickleball.modules.order.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.order.dto.CreateOrderRequest;
import com.demopick.pickleball.modules.order.dto.CreateOrderResponse;
import com.demopick.pickleball.modules.order.entity.Order;
import com.demopick.pickleball.modules.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication
    ) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            userId = (Long) authentication.getPrincipal();
        }
        CreateOrderResponse response = orderService.createOrder(request, userId);
        return ResponseEntity.ok(ApiResponse.success(response, "Tạo đơn hàng thành công."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getOrders(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long)) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList(), "Chưa đăng nhập."));
        }
        Long userId = (Long) authentication.getPrincipal();
        List<Order> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách đơn hàng thành công."));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<Order>> getOrderByCode(@PathVariable String code) {
        Order order = orderService.getOrderByCode(code);
        return ResponseEntity.ok(ApiResponse.success(order, "Lấy chi tiết đơn hàng thành công."));
    }

    @PostMapping("/{code}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(
            @PathVariable String code,
            @RequestBody(required = false) java.util.Map<String, String> body,
            Authentication authentication
    ) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            userId = (Long) authentication.getPrincipal();
        }
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Người dùng hủy đơn hàng";
        Order order = orderService.cancelOrder(code, reason, userId);
        return ResponseEntity.ok(ApiResponse.success(order, "Hủy đơn hàng và giải phóng ca sân thành công."));
    }
}
