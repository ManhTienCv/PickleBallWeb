package com.demopick.pickleball.modules.booking.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.booking.dto.HoldRequest;
import com.demopick.pickleball.modules.booking.dto.HoldResponse;
import com.demopick.pickleball.modules.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/booking/hold")
public class HoldController {

    private final BookingService bookingService;

    public HoldController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HoldResponse>> holdSlot(
            @Valid @RequestBody HoldRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            userId = (Long) authentication.getPrincipal();
        }

        HoldResponse response = bookingService.holdSlot(request, userId, sessionId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Giữ chỗ ca sân thành công trong 10 phút."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> releaseHold(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof Long) {
            userId = (Long) authentication.getPrincipal();
        }

        bookingService.releaseHold(id, userId, sessionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy giữ chỗ thành công."));
    }
}
