package com.demopick.pickleball.modules.order.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.order.entity.Order;
import com.demopick.pickleball.modules.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAdminOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách tất cả đơn hàng thành công."));
    }

    @GetMapping("/{idOrCode}")
    public ResponseEntity<ApiResponse<Order>> getOrderDetail(@PathVariable String idOrCode) {
        Order order = orderService.getOrderByCode(idOrCode);
        return ResponseEntity.ok(ApiResponse.success(order, "Lấy chi tiết đơn hàng thành công."));
    }

    @RequestMapping(value = {"/{idOrCode}/status", "/{idOrCode}"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<ApiResponse<Order>> updateStatus(
            @PathVariable String idOrCode,
            @RequestBody Map<String, String> payload
    ) {
        String status = (payload != null) ? payload.get("status") : null;
        Order order = orderService.updateOrderStatus(idOrCode, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Cập nhật trạng thái đơn hàng thành công."));
    }

    @PostMapping("/{code}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(
            @PathVariable String code,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            userId = (Long) authentication.getPrincipal();
        }
        String reason = (body != null && body.containsKey("reason"))
                ? body.get("reason")
                : "Quản trị viên hủy đơn hàng";
        Order order = orderService.cancelOrder(code, reason, userId);
        return ResponseEntity.ok(ApiResponse.success(order, "Hủy đơn hàng và giải phóng ca sân/tồn kho thành công."));
    }

    @PostMapping("/{code}/refund")
    public ResponseEntity<ApiResponse<Order>> refundOrder(
            @PathVariable String code,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String transId = null;
        String note = null;
        if (body != null) {
            transId = body.getOrDefault("refund_trans_id", body.get("refundTransId"));
            note = body.getOrDefault("refund_note", body.get("refundNote"));
        }
        Order order = orderService.confirmRefund(code, transId, note);
        return ResponseEntity.ok(ApiResponse.success(order, "Xác nhận hoàn tiền và giải phóng ca sân thành công."));
    }
}
