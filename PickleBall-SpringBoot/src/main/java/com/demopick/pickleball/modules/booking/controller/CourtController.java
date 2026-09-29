package com.demopick.pickleball.modules.booking.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.booking.dto.CourtAvailabilityResponse;
import com.demopick.pickleball.modules.booking.entity.Court;
import com.demopick.pickleball.modules.booking.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/courts")
public class CourtController {

    private final BookingService bookingService;

    public CourtController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Court>>> getAllCourts() {
        List<Court> courts = bookingService.getAllCourts();
        return ResponseEntity.ok(ApiResponse.success(courts, "Lấy danh sách sân thành công."));
    }

    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<List<CourtAvailabilityResponse>>> getAvailability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        if (date == null) date = LocalDate.now();
        List<CourtAvailabilityResponse> availability = bookingService.getCourtAvailability(date);
        return ResponseEntity.ok(ApiResponse.success(availability, "Lấy ma trận ca sân thành công."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Court>> getCourtById(@PathVariable Long id) {
        Court court = bookingService.getCourtById(id);
        return ResponseEntity.ok(ApiResponse.success(court, "Lấy chi tiết sân thành công."));
    }
}
