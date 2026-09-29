package com.demopick.pickleball.modules.report.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/reports")
public class ReportController {

    public ReportController() {}

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueReport() {
        Map<String, Object> data = new HashMap<>();
        data.put("total_revenue", 48500000);
        data.put("booking_revenue", 32000000);
        data.put("shop_revenue", 16500000);
        data.put("chart_data", List.of(
                Map.of("date", "2026-09-25", "amount", 6500000),
                Map.of("date", "2026-09-26", "amount", 9800000),
                Map.of("date", "2026-09-27", "amount", 12400000),
                Map.of("date", "2026-09-28", "amount", 10200000),
                Map.of("date", "2026-09-29", "amount", 9600000)
        ));
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy thống kê doanh thu thành công."));
    }

    @GetMapping("/utilization-rate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUtilizationRate() {
        Map<String, Object> data = new HashMap<>();
        data.put("overall_rate", 78.5);
        data.put("peak_hours_rate", 94.2);
        data.put("off_peak_rate", 58.0);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy tỷ lệ lấp đầy sân thành công."));
    }
}
