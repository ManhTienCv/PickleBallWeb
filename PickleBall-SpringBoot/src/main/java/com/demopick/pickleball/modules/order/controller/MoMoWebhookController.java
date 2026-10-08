package com.demopick.pickleball.modules.order.controller;

import com.demopick.pickleball.modules.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping
public class MoMoWebhookController {

    private final OrderService orderService;

    public MoMoWebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping({"/api/v1/webhooks/payment/momo", "/api/v1/payments/webhook/momo"})
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {
        orderService.handleMoMoWebhook(payload);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/api/v1/payments/momo/verify", "/api/v1/payment/momo/verify"})
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody(required = false) Map<String, Object> payload) {
        if (payload == null) {
            payload = new HashMap<>();
        }
        boolean success = orderService.verifyMomoPayment(payload);
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("orderCode", payload.get("orderId") != null ? payload.get("orderId") : payload.get("orderCode"));
        response.put("resultCode", success ? 0 : 99);
        response.put("message", success ? "Xác nhận thanh toán MoMo thành công!" : "Giao dịch chưa hoàn tất hoặc thất bại.");
        return ResponseEntity.ok(response);
    }
}
