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
            map.put("court_id", c.getId());
            map.put("court_name", c.getName());
            map.put("court_code", c.getCode());
            map.put("status", c.getStatus());
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

    @PostMapping("/checkin/scan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> scanCheckIn(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        Map<String, Object> result = new HashMap<>();
        result.put("scanned_code", code);
        result.put("status", "checked_in");
        result.put("checkin_time", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success(result, "Check-in mã vé vào sân thành công."));
    }
}
