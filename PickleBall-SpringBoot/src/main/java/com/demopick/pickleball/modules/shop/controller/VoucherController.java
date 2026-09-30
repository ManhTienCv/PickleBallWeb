package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.shop.entity.Voucher;
import com.demopick.pickleball.modules.shop.repository.VoucherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/vouchers")
public class VoucherController {

    private final VoucherRepository voucherRepository;

    public VoucherController(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Voucher>>> getPublicVouchers() {
        List<Voucher> active = voucherRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(active, "Lấy danh sách mã ưu đãi khả dụng thành công."));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyVoucher(@RequestBody Map<String, Object> payload) {
        String code = payload.get("code") != null ? String.valueOf(payload.get("code")).trim().toUpperCase() : "";
        double orderAmount = 0.0;
        if (payload.get("order_amount") != null) {
            orderAmount = Double.parseDouble(String.valueOf(payload.get("order_amount")));
        }

        if (code.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng nhập mã ưu đãi.", null));
        }

        Optional<Voucher> opt = voucherRepository.findByCode(code);
        if (opt.isEmpty() || !Boolean.TRUE.equals(opt.get().getIsActive())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã ưu đãi không tồn tại hoặc đã hết hiệu lực.", null));
        }

        Voucher voucher = opt.get();
        if (voucher.getMinOrderAmount() != null && orderAmount < voucher.getMinOrderAmount()) {
            String formattedMin = String.format("%,.0f", voucher.getMinOrderAmount());
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    "Đơn hàng chưa đạt giá trị tối thiểu " + formattedMin + "đ để áp dụng mã này.", null));
        }

        double discountAmount = 0.0;
        if ("percentage".equalsIgnoreCase(voucher.getDiscountType())) {
            discountAmount = (orderAmount * voucher.getDiscountValue()) / 100.0;
            if (voucher.getMaxDiscount() != null && voucher.getMaxDiscount() > 0) {
                discountAmount = Math.min(discountAmount, voucher.getMaxDiscount());
            }
        } else {
            discountAmount = voucher.getDiscountValue() != null ? voucher.getDiscountValue() : 0.0;
        }

        discountAmount = Math.min(discountAmount, orderAmount);
        double finalAmount = Math.max(0.0, orderAmount - discountAmount);

        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("code", voucher.getCode());
        result.put("title", voucher.getTitle());
        result.put("discount_type", voucher.getDiscountType());
        result.put("discount_value", voucher.getDiscountValue());
        result.put("discount_amount", discountAmount);
        result.put("final_amount", finalAmount);
        result.put("message", "Áp dụng mã ưu đãi thành công!");

        return ResponseEntity.ok(ApiResponse.success(result, "Áp dụng mã ưu đãi thành công!"));
    }
}
