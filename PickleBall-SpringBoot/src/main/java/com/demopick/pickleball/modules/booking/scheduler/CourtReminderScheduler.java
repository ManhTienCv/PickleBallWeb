package com.demopick.pickleball.modules.booking.scheduler;

import com.demopick.pickleball.common.service.EmailService;
import com.demopick.pickleball.modules.booking.entity.Court;
import com.demopick.pickleball.modules.booking.entity.TimeSlot;
import com.demopick.pickleball.modules.booking.repository.CourtRepository;
import com.demopick.pickleball.modules.booking.repository.TimeSlotRepository;
import com.demopick.pickleball.modules.order.entity.Order;
import com.demopick.pickleball.modules.order.entity.OrderItem;
import com.demopick.pickleball.modules.order.repository.OrderItemRepository;
import com.demopick.pickleball.modules.order.repository.OrderRepository;
import com.demopick.pickleball.modules.user.entity.User;
import com.demopick.pickleball.modules.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CourtReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(CourtReminderScheduler.class);
    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final TimeSlotRepository timeSlotRepository;
    private final CourtRepository courtRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // Cache lưu trữ ID các slot đã gửi email nhắc nhở để tránh gửi trùng
    private final Set<Long> remindedSlotIds = ConcurrentHashMap.newKeySet();
    private LocalDate lastCheckedDate = null;

    public CourtReminderScheduler(TimeSlotRepository timeSlotRepository,
                                  CourtRepository courtRepository,
                                  OrderItemRepository orderItemRepository,
                                  OrderRepository orderRepository,
                                  UserRepository userRepository,
                                  EmailService emailService) {
        this.timeSlotRepository = timeSlotRepository;
        this.courtRepository = courtRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Tự động kiểm tra và gửi email nhắc nhở trước giờ chơi
     * Chạy định kỳ mỗi 15 phút trong khoảng thời gian mở sân 06:00 - 22:00
     */
    @Scheduled(cron = "0 */15 6-22 * * *")
    public void scheduleUpcomingCourtReminders() {
        LocalDate today = LocalDate.now(VN_ZONE);
        LocalTime now = LocalTime.now(VN_ZONE);

        // Reset cache khi bước sang ngày mới
        if (lastCheckedDate == null || !lastCheckedDate.equals(today)) {
            remindedSlotIds.clear();
            lastCheckedDate = today;
        }

        // Lấy tất cả slot đã được đặt trong ngày hôm nay
        List<TimeSlot> bookedSlots = timeSlotRepository.findByDateAndStatusOrderByStartTimeAsc(today, "booked");
        if (bookedSlots == null || bookedSlots.isEmpty()) {
            return;
        }

        LocalTime reminderWindow = now.plusMinutes(60);

        for (TimeSlot slot : bookedSlots) {
            if (remindedSlotIds.contains(slot.getId())) {
                continue;
            }

            LocalTime start = slot.getStartTime();
            if (start == null) continue;

            // Kiểm tra slot sắp diễn ra trong khoảng 10 đến 60 phút tới
            if (start.isAfter(now) && start.isBefore(reminderWindow)) {
                sendReminderForSlot(slot, today);
            }
        }
    }

    private void sendReminderForSlot(TimeSlot slot, LocalDate today) {
        try {
            // Tìm OrderItem liên kết với ca chơi
            List<OrderItem> items = orderItemRepository.findByItemTypeAndReferenceId("booking_slot", slot.getId());
            if (items == null || items.isEmpty()) {
                return;
            }

            OrderItem targetItem = items.get(0);
            Order order = targetItem.getOrder();
            if (order == null && targetItem.getOrderId() != null) {
                order = orderRepository.findById(targetItem.getOrderId()).orElse(null);
            }

            if (order == null) return;

            // Xác định email người nhận
            String recipientEmail = order.getCustomerEmail();
            if ((recipientEmail == null || recipientEmail.isBlank()) && order.getUserId() != null) {
                User user = userRepository.findById(order.getUserId()).orElse(null);
                if (user != null) {
                    recipientEmail = user.getEmail();
                }
            }

            if (recipientEmail == null || recipientEmail.isBlank()) {
                return;
            }

            // Tên sân
            Court court = courtRepository.findById(slot.getCourtId()).orElse(null);
            String courtName = court != null ? court.getName() : "Sân Pickleball #" + slot.getCourtId();

            String customerName = order.getCustomerName() != null ? order.getCustomerName() : "Quý khách";
            String dateFormatted = today.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            String timeRange = slot.getStartTime() + " - " + slot.getEndTime();
            String orderCode = order.getOrderCode();

            boolean sent = emailService.sendCourtReminderEmail(
                    recipientEmail,
                    customerName,
                    courtName,
                    dateFormatted,
                    timeRange,
                    orderCode
            );

            if (sent) {
                remindedSlotIds.add(slot.getId());
                log.info("Đã gửi email nhắc nhở ra sân tới {} cho ca chơi slot #{} ({})", recipientEmail, slot.getId(), courtName);
            }
        } catch (Exception ex) {
            log.warn("Lỗi khi gửi email nhắc nhở cho slot #{}: {}", slot.getId(), ex.getMessage());
        }
    }
}
