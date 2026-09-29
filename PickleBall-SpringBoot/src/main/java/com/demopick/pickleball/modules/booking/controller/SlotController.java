package com.demopick.pickleball.modules.booking.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.booking.entity.TimeSlot;
import com.demopick.pickleball.modules.booking.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/slots")
public class SlotController {

    private final BookingService bookingService;

    public SlotController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimeSlot>>> getSlots(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "court_id", required = false) Long courtIdSnake,
            @RequestParam(value = "courtId", required = false) Long courtIdCamel
    ) {
        if (date == null) date = LocalDate.now();
        Long courtId = courtIdSnake != null ? courtIdSnake : courtIdCamel;
        List<TimeSlot> slots = bookingService.getSlots(date, courtId);
        return ResponseEntity.ok(ApiResponse.success(slots, "Lấy danh sách ca sân thành công."));
    }
}
