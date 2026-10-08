package com.demopick.pickleball.modules.booking.service;

import com.demopick.pickleball.common.exception.ApiException;
import com.demopick.pickleball.modules.booking.dto.CourtAvailabilityResponse;
import com.demopick.pickleball.modules.booking.dto.HoldRequest;
import com.demopick.pickleball.modules.booking.dto.HoldResponse;
import com.demopick.pickleball.modules.booking.dto.SlotDto;
import com.demopick.pickleball.modules.booking.entity.Court;
import com.demopick.pickleball.modules.booking.entity.Hold;
import com.demopick.pickleball.modules.booking.entity.TimeSlot;
import com.demopick.pickleball.modules.booking.repository.CourtRepository;
import com.demopick.pickleball.modules.booking.repository.HoldRepository;
import com.demopick.pickleball.modules.booking.repository.TimeSlotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private static final java.time.ZoneId VN_ZONE = java.time.ZoneId.of("Asia/Ho_Chi_Minh");

    private final CourtRepository courtRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final HoldRepository holdRepository;

    public BookingService(CourtRepository courtRepository, TimeSlotRepository timeSlotRepository, HoldRepository holdRepository) {
        this.courtRepository = courtRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.holdRepository = holdRepository;
    }

    public List<Court> getAllCourts() {
        return courtRepository.findByDeletedAtIsNullOrderByCodeAsc();
    }

    public Court getCourtById(Long id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy sân.", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public List<TimeSlot> getSlots(LocalDate date, Long courtId) {
        if (date == null) date = LocalDate.now(VN_ZONE);
        List<TimeSlot> slots = (courtId != null)
                ? timeSlotRepository.findByCourtIdAndDateOrderByStartTimeAsc(courtId, date)
                : timeSlotRepository.findByDateOrderByStartTimeAsc(date);

        LocalDateTime now = LocalDateTime.now(VN_ZONE);
        for (TimeSlot slot : slots) {
            if ("held".equalsIgnoreCase(slot.getStatus())) {
                Optional<Hold> activeHold = holdRepository.findBySlotIdAndStatusAndExpiresAtAfter(
                        slot.getId(), "active", now
                );
                if (activeHold.isEmpty()) {
                    slot.setStatus("available");
                    timeSlotRepository.save(slot);
                    log.info("Auto reverted stale held slot {} back to available in getSlots()", slot.getId());
                }
            }
        }
        return slots;
    }

    @Transactional
    public List<CourtAvailabilityResponse> getCourtAvailability(LocalDate date) {
        if (date == null) date = LocalDate.now(VN_ZONE);

        List<Court> courts = getAllCourts();
        List<TimeSlot> slots = timeSlotRepository.findByDateOrderByStartTimeAsc(date);

        LocalDateTime now = LocalDateTime.now(VN_ZONE);
        List<CourtAvailabilityResponse> result = new ArrayList<>();

        for (Court court : courts) {
            List<SlotDto> slotDtos = new ArrayList<>();
            for (TimeSlot slot : slots) {
                if (slot.getCourtId().equals(court.getId())) {
                    LocalDateTime slotStart = LocalDateTime.of(slot.getDate(), slot.getStartTime());
                    boolean isCutoff = false;

                    // 30-min cut-off rule for today
                    if (slot.getDate().equals(LocalDate.now(VN_ZONE))) {
                        if (slotStart.isBefore(now.plusMinutes(30))) {
                            isCutoff = true;
                        }
                    }

                    String status = slot.getStatus();
                    if ("held".equalsIgnoreCase(status)) {
                        Optional<Hold> activeHold = holdRepository.findBySlotIdAndStatusAndExpiresAtAfter(
                                slot.getId(), "active", now
                        );
                        if (activeHold.isEmpty()) {
                            status = "available";
                            slot.setStatus("available");
                            timeSlotRepository.save(slot);
                        }
                    }

                    slotDtos.add(new SlotDto(
                            slot.getId(),
                            slot.getCourtId(),
                            slot.getDate().toString(),
                            slot.getStartTime().toString().substring(0, 5),
                            slot.getEndTime().toString().substring(0, 5),
                            slot.getPrice(),
                            status,
                            isCutoff
                    ));
                }
            }

            result.add(new CourtAvailabilityResponse(
                    court.getId(),
                    court.getName(),
                    court.getCode(),
                    court.getSurfaceType(),
                    slotDtos
            ));
        }

        return result;
    }

    @Transactional
    public HoldResponse holdSlot(HoldRequest request, Long userId, String sessionId) {
        Long slotId = request.getSlotId();
        if (slotId == null) {
            throw new ApiException("Vui lòng chọn khung giờ ca sân.", HttpStatus.BAD_REQUEST);
        }

        // Pessimistic Lock on slot
        TimeSlot slot = timeSlotRepository.findByIdWithLock(slotId)
                .orElseThrow(() -> new ApiException("Không tìm thấy ca sân.", HttpStatus.NOT_FOUND));

        LocalDateTime now = LocalDateTime.now(VN_ZONE);
        LocalDateTime slotStart = LocalDateTime.of(slot.getDate(), slot.getStartTime());

        // 1. Cut-off 30 min check
        if (slot.getDate().equals(LocalDate.now(VN_ZONE)) && slotStart.isBefore(now.plusMinutes(30))) {
            throw new ApiException("Không thể đặt trực tuyến ca sân sắp diễn ra dưới 30 phút. Vui lòng liên hệ quầy.", HttpStatus.BAD_REQUEST);
        }

        // 2. Check booked
        if ("booked".equalsIgnoreCase(slot.getStatus())) {
            throw new ApiException("Ca sân này đã được đặt và thanh toán.", HttpStatus.CONFLICT);
        }

        // 3. Check existing active hold
        Optional<Hold> existingHold = holdRepository.findBySlotIdAndStatusAndExpiresAtAfter(
                slotId, "active", now
        );

        if (existingHold.isPresent()) {
            Hold hold = existingHold.get();
            // If held by another authenticated user
            if (userId != null && hold.getUserId() != null && !userId.equals(hold.getUserId())) {
                throw new ApiException("Ca sân này vừa có người giữ chỗ.", HttpStatus.CONFLICT);
            }
            // If held by another guest session
            if (userId == null && sessionId != null && hold.getSessionId() != null && !sessionId.equals(hold.getSessionId())) {
                throw new ApiException("Ca sân này vừa có người giữ chỗ.", HttpStatus.CONFLICT);
            }

            // Same user/session: RENEW existing hold (extend by 10 mins), DO NOT create duplicate records
            LocalDateTime expiresAt = now.plusMinutes(10);
            hold.setExpiresAt(expiresAt);
            if (userId != null) hold.setUserId(userId);
            if (sessionId != null) hold.setSessionId(sessionId);
            hold = holdRepository.save(hold);

            slot.setStatus("held");
            timeSlotRepository.save(slot);

            return new HoldResponse(
                    hold.getId(),
                    slotId,
                    slot.getCourtId(),
                    expiresAt.toString(),
                    600,
                    slot.getPrice()
            );
        }

        // Create new hold (10 minutes)
        LocalDateTime expiresAt = now.plusMinutes(10);
        Hold hold = new Hold();
        hold.setSlotId(slotId);
        hold.setUserId(userId);
        hold.setSessionId(sessionId);
        hold.setExpiresAt(expiresAt);
        hold.setStatus("active");
        hold = holdRepository.save(hold);

        // Update slot status
        slot.setStatus("held");
        timeSlotRepository.save(slot);

        return new HoldResponse(
                hold.getId(),
                slotId,
                slot.getCourtId(),
                expiresAt.toString(),
                600,
                slot.getPrice()
        );
    }

    @Transactional
    public void releaseHold(Long id, Long userId, String sessionId) {
        Hold hold = holdRepository.findById(id).orElse(null);
        Long actualSlotId = null;

        if (hold != null) {
            actualSlotId = hold.getSlotId();
        } else {
            // Fallback if caller passed slotId instead of holdId
            hold = holdRepository.findBySlotIdAndStatusAndExpiresAtAfter(id, "active", LocalDateTime.now(VN_ZONE)).orElse(null);
            actualSlotId = id;
        }

        if (hold != null) {
            // Verify ownership: must match userId or sessionId
            if (userId != null && hold.getUserId() != null && !userId.equals(hold.getUserId())) {
                throw new ApiException("Bạn không có quyền hủy giữ chỗ của người khác.", HttpStatus.FORBIDDEN);
            }
            if (userId == null && sessionId != null && hold.getSessionId() != null && !sessionId.equals(hold.getSessionId())) {
                throw new ApiException("Bạn không có quyền hủy giữ chỗ của phiên khác.", HttpStatus.FORBIDDEN);
            }

            hold.setStatus("expired");
            holdRepository.save(hold);
        }

        if (actualSlotId != null) {
            // Only revert slot to 'available' if NO other active hold exists for this slot
            boolean hasOtherActiveHolds = holdRepository.existsBySlotIdAndStatusAndExpiresAtAfter(
                    actualSlotId, "active", LocalDateTime.now(VN_ZONE)
            );
            if (!hasOtherActiveHolds) {
                TimeSlot slot = timeSlotRepository.findById(actualSlotId).orElse(null);
                if (slot != null && "held".equalsIgnoreCase(slot.getStatus())) {
                    slot.setStatus("available");
                    timeSlotRepository.save(slot);
                }
            }
        }
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoReleaseExpiredHolds() {
        LocalDateTime now = LocalDateTime.now(VN_ZONE);
        List<Hold> expiredHolds = holdRepository.findByStatusAndExpiresAtBefore("active", now);

        for (Hold hold : expiredHolds) {
            hold.setStatus("expired");
            holdRepository.save(hold);

            // Only set slot to 'available' if NO other active hold exists for this slot
            boolean stillHasActiveHold = holdRepository.existsBySlotIdAndStatusAndExpiresAtAfter(
                    hold.getSlotId(), "active", now
            );
            if (!stillHasActiveHold) {
                TimeSlot slot = timeSlotRepository.findById(hold.getSlotId()).orElse(null);
                if (slot != null && "held".equalsIgnoreCase(slot.getStatus())) {
                    slot.setStatus("available");
                    timeSlotRepository.save(slot);
                    log.info("Auto released expired hold for slot id: {}", slot.getId());
                }
            }
        }
    }
}
