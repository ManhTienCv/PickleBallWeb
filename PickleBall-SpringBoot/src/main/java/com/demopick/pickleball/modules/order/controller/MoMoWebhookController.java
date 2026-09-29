package com.demopick.pickleball.modules.order.controller;

import com.demopick.pickleball.modules.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
