package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
public class AdminVoucherController {

    private static final List<Map<String, Object>> VOUCHERS = Collections.synchronizedList(new ArrayList<>());

    static {
        Map<String, Object> v1 = new HashMap<>();
        v1.put("id", 1L);
        v1.put("code", "WELCOME2026");
        v1.put("title", "Ưu Đãi Hội Viên Mới");
        v1.put("description", "Giảm ngay 50.000đ cho đơn hàng đầu tiên từ 300.000đ");
        v1.put("discount_type", "fixed");
        v1.put("discount_value", 50000);
        v1.put("max_discount", null);
        v1.put("min_order_amount", 300000);
        v1.put("usage_limit", 1000);
        v1.put("used_count", 142);
        v1.put("start_date", "2026-01-01");
        v1.put("end_date", "2026-12-31");
        v1.put("is_active", true);
        v1.put("created_at", "2026-01-01 08:00:00");
        VOUCHERS.add(v1);

        Map<String, Object> v2 = new HashMap<>();
        v2.put("id", 2L);
        v2.put("code", "PICKLEBALL10");
        v2.put("title", "Giảm 10% Vợt Thi Đấu");
        v2.put("description", "Áp dụng cho mọi dòng vợt USAPA cao cấp Joola & Selkirk");
        v2.put("discount_type", "percentage");
        v2.put("discount_value", 10);
        v2.put("max_discount", 200000);
        v2.put("min_order_amount", 500000);
        v2.put("usage_limit", 500);
        v2.put("used_count", 89);
        v2.put("start_date", "2026-06-01");
        v2.put("end_date", "2026-12-31");
        v2.put("is_active", true);
        v2.put("created_at", "2026-06-01 09:00:00");
        VOUCHERS.add(v2);

        Map<String, Object> v3 = new HashMap<>();
        v3.put("id", 3L);
        v3.put("code", "FREESHIP");
        v3.put("title", "Miễn Phí Giao Hàng Toàn Quốc");
        v3.put("description", "Hỗ trợ tối đa 35.000đ cước chuyển phát nhanh GHN");
        v3.put("discount_type", "fixed");
        v3.put("discount_value", 35000);
        v3.put("max_discount", 35000);
        v3.put("min_order_amount", 400000);
        v3.put("usage_limit", 2000);
        v3.put("used_count", 531);
        v3.put("start_date", "2026-03-01");
        v3.put("end_date", "2026-12-31");
        v3.put("is_active", true);
        v3.put("created_at", "2026-03-01 10:00:00");
        VOUCHERS.add(v3);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVouchers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        List<Map<String, Object>> filtered = new ArrayList<>(VOUCHERS);
        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            filtered = filtered.stream()
                    .filter(v -> String.valueOf(v.get("code")).toLowerCase().contains(lower) ||
                                 String.valueOf(v.get("title")).toLowerCase().contains(lower))
                    .toList();
        }
        return ResponseEntity.ok(ApiResponse.success(filtered, "Lấy danh sách mã ưu đãi thành công."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createVoucher(@RequestBody Map<String, Object> payload) {
        Map<String, Object> newVoucher = new HashMap<>(payload);
        newVoucher.put("id", System.currentTimeMillis());
        newVoucher.put("used_count", 0);
        newVoucher.put("created_at", java.time.LocalDateTime.now().toString());
        VOUCHERS.add(0, newVoucher);
        return ResponseEntity.ok(ApiResponse.success(newVoucher, "Tạo mã ưu đãi thành công."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateVoucher(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        for (Map<String, Object> v : VOUCHERS) {
            if (Objects.equals(v.get("id"), id)) {
                v.putAll(payload);
                return ResponseEntity.ok(ApiResponse.success(v, "Cập nhật mã ưu đãi thành công."));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(payload, "Cập nhật thành công."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        VOUCHERS.removeIf(v -> Objects.equals(v.get("id"), id));
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa mã ưu đãi thành công."));
    }
}
