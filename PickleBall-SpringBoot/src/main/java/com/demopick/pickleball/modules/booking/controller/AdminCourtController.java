package com.demopick.pickleball.modules.booking.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.booking.entity.Court;
import com.demopick.pickleball.modules.booking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminCourtController {

    private final BookingService bookingService;

    public AdminCourtController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/courts")
    public ResponseEntity<ApiResponse<List<Court>>> getAdminCourts() {
        List<Court> courts = bookingService.getAllCourts();
        return ResponseEntity.ok(ApiResponse.success(courts, "Lấy danh sách sân quản trị thành công."));
    }

    @GetMapping("/courts/live-status")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLiveStatus() {
        List<Court> courts = bookingService.getAllCourts();
        List<Map<String, Object>> liveList = courts.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("court_id", c.getId());
            map.put("name", c.getName());
            map.put("court_name", c.getName());
            map.put("code", c.getCode());
            map.put("court_code", c.getCode());
            double rate = (c.getId() != null && (c.getId() == 5 || c.getId() == 6)) ? 180000.0 : 140000.0;
            map.put("surface_type", c.getSurfaceType() != null ? c.getSurfaceType() : "Tiêu Chuẩn Pro");
            map.put("status", "available");
            map.put("status_label", "TRỐNG");
            map.put("session_id", null);
            map.put("hourly_rate", rate);
            map.put("customer_name", null);
            map.put("customer_phone", null);
            map.put("available_minutes_until_next", 180);
            map.put("is_in_use", false);
            return map;
        }).toList();
        return ResponseEntity.ok(ApiResponse.success(liveList, "Lấy trạng thái sân trực tiếp thành công."));
    }

    @PostMapping("/courts/{courtId}/lock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> lockCourt(
            @PathVariable Long courtId,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        String status = (payload != null && payload.containsKey("status"))
                ? String.valueOf(payload.get("status"))
                : "maintenance";
        Map<String, Object> result = new HashMap<>();
        result.put("id", courtId);
        result.put("status", status);
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật trạng thái khóa sân thành công."));
    }

    @PostMapping("/courts/{courtId}/start-session")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startSession(
            @PathVariable Long courtId,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        Map<String, Object> result = new HashMap<>();
        result.put("court_id", courtId);
        result.put("status", "in_use");
        result.put("started_at", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success(result, "Bắt đầu phiên sử dụng sân thành công."));
    }

    @PostMapping("/courts/{courtId}/stop-session")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stopSession(@PathVariable Long courtId) {
        Map<String, Object> result = new HashMap<>();
        result.put("court_id", courtId);
        result.put("status", "available");
        result.put("stopped_at", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success(result, "Kết thúc phiên sử dụng sân thành công."));
    }

    private final Map<String, String> checkedInRecords = new java.util.concurrent.ConcurrentHashMap<>();

    @PostMapping("/checkin/scan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanCheckIn(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        if (code == null || code.isBlank()) {
            code = payload.get("qr_token");
        }
        if (code == null || code.isBlank()) {
            code = payload.get("booking_code");
        }
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng cung cấp mã vé hoặc quét mã QR.", null));
        }

        String cleanCode = code.trim().toUpperCase();

        if (checkedInRecords.containsKey(cleanCode)) {
            String prevTime = checkedInRecords.get(cleanCode);
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Vé #" + cleanCode + " đã được check-in trước đó vào lúc " + prevTime + "! Không thể sử dụng lại.", null));
        }

        String now = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
        checkedInRecords.put(cleanCode, now);

        Map<String, Object> result = new HashMap<>();
        result.put("scanned_code", cleanCode);
        result.put("status", "checked_in");
        result.put("checkin_time", now);
        return ResponseEntity.ok(ApiResponse.success(result, "Check-in mã vé vào sân thành công."));
    }
}
