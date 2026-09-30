package com.demopick.pickleball.modules.order.service;

import com.demopick.pickleball.common.exception.ApiException;
import com.demopick.pickleball.modules.booking.entity.Hold;
import com.demopick.pickleball.modules.booking.entity.TimeSlot;
import com.demopick.pickleball.modules.booking.repository.HoldRepository;
import com.demopick.pickleball.modules.booking.repository.TimeSlotRepository;
import com.demopick.pickleball.modules.order.dto.CheckoutRequest;
import com.demopick.pickleball.modules.order.dto.CheckoutResponse;
import com.demopick.pickleball.modules.order.entity.Order;
import com.demopick.pickleball.modules.order.entity.OrderItem;
import com.demopick.pickleball.modules.order.repository.OrderItemRepository;
import com.demopick.pickleball.modules.order.repository.OrderRepository;
import com.demopick.pickleball.modules.shop.entity.ProductVariant;
import com.demopick.pickleball.modules.shop.repository.ProductVariantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final HoldRepository holdRepository;
    private final ProductVariantRepository productVariantRepository;

    @Value("${momo.secret-key}")
    private String momoSecretKey;

    @Value("${momo.redirect-url}")
    private String momoRedirectUrl;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        TimeSlotRepository timeSlotRepository,
                        HoldRepository holdRepository,
                        ProductVariantRepository productVariantRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.holdRepository = holdRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, Long userId) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> itemsToSave = new ArrayList<>();

        String orderType = "mixed";
        if (request.getSlotId() != null && (request.getCartItems() == null || request.getCartItems().isEmpty())) {
            orderType = "booking";
        } else if (request.getSlotId() == null && request.getCartItems() != null && !request.getCartItems().isEmpty()) {
            orderType = "shop";
        }

        // 1. Process Booking Slot if requested
        Hold holdToConvert = null;
        if (request.getSlotId() != null) {
            Long slotId = request.getSlotId();
            TimeSlot slot = timeSlotRepository.findByIdWithLock(slotId)
                    .orElseThrow(() -> new ApiException("Không tìm thấy ca sân.", HttpStatus.NOT_FOUND));

            if ("booked".equalsIgnoreCase(slot.getStatus())) {
                throw new ApiException("Ca sân này đã được đặt và thanh toán.", HttpStatus.CONFLICT);
            }

            // Strictly validate hold
            LocalDateTime now = LocalDateTime.now();
            Long holdId = request.getHoldId();
            Hold hold = null;

            if (holdId != null) {
                hold = holdRepository.findById(holdId).orElse(null);
            } else {
                // Fallback lookup active hold by slot
                hold = holdRepository.findBySlotIdAndStatusAndExpiresAtAfter(slotId, "active", now).orElse(null);
            }

            if (hold == null || !"active".equalsIgnoreCase(hold.getStatus()) || hold.getExpiresAt().isBefore(now)) {
                throw new ApiException("Thời gian giữ chỗ ca sân đã hết hạn hoặc không tồn tại. Vui lòng chọn lại ca sân.", HttpStatus.GONE);
            }

            if (!slotId.equals(hold.getSlotId())) {
                throw new ApiException("Mã giữ chỗ không khớp với ca sân được chọn.", HttpStatus.BAD_REQUEST);
            }

            // Verify hold ownership if userId is present
            if (userId != null && hold.getUserId() != null && !userId.equals(hold.getUserId())) {
                throw new ApiException("Lượt giữ chỗ này thuộc về tài khoản khác.", HttpStatus.FORBIDDEN);
            }

            holdToConvert = hold;

            BigDecimal slotPrice = slot.getPrice() != null ? slot.getPrice() : BigDecimal.valueOf(150000);
            totalAmount = totalAmount.add(slotPrice);

            OrderItem slotItem = new OrderItem();
            slotItem.setItemType("booking_slot");
            slotItem.setReferenceId(slot.getId());
            slotItem.setItemName("Thuê ca sân Pickleball (" + slot.getStartTime() + " - " + slot.getEndTime() + ")");
            slotItem.setQuantity(1);
            slotItem.setUnitPrice(slotPrice);
            slotItem.setTotalPrice(slotPrice);
            itemsToSave.add(slotItem);
        }

        // 2. Process Cart Items if any
        if (request.getCartItems() != null) {
            for (CheckoutRequest.CartItemDto item : request.getCartItems()) {
                ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                        .orElseThrow(() -> new ApiException("Không tìm thấy biến thể sản phẩm ID: " + item.getVariantId(), HttpStatus.NOT_FOUND));

                if (variant.getStockQty() < item.getQuantity()) {
                    throw new ApiException("Sản phẩm '" + variant.getSku() + "' không đủ số lượng tồn kho.", HttpStatus.UNPROCESSABLE_ENTITY);
                }

                BigDecimal itemPrice = variant.getPriceOverride() != null ? variant.getPriceOverride() : BigDecimal.valueOf(500000);
                BigDecimal subtotal = itemPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                totalAmount = totalAmount.add(subtotal);

                OrderItem prodItem = new OrderItem();
                prodItem.setItemType("product");
                prodItem.setReferenceId(variant.getId());
                prodItem.setItemName("Sản phẩm " + variant.getSku());
                prodItem.setItemSku(variant.getSku());
                prodItem.setQuantity(item.getQuantity());
                prodItem.setUnitPrice(itemPrice);
                prodItem.setTotalPrice(subtotal);
                itemsToSave.add(prodItem);

                // Reduce stock
                variant.setStockQty(variant.getStockQty() - item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        if (totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            totalAmount = BigDecimal.valueOf(100000);
        }

        // 3. Create Order
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String orderCode = "ORD-" + datePrefix + "-" + (int) (1000 + Math.random() * 9000);

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setUserId(userId);
        order.setOrderType(orderType);
        order.setSubtotal(totalAmount);
        order.setDiscount(BigDecimal.ZERO);
        order.setTotalAmount(totalAmount);
        order.setStatus("pending");
        order.setPaymentStatus("unpaid");
        order.setPickupNotes(request.getPickupNotes());

        order = orderRepository.save(order);

        for (OrderItem item : itemsToSave) {
            item.setOrder(order);
            item.setOrderId(order.getId());
            orderItemRepository.save(item);
        }

        // Convert hold to 'converted' so auto-release cronjob does not expire it
        if (holdToConvert != null) {
            holdToConvert.setStatus("converted");
            holdRepository.save(holdToConvert);
        }

        // 4. Generate MoMo Sandbox Pay URL or VietQR URL
        String payUrl = momoRedirectUrl + "?orderId=" + orderCode + "&amount=" + totalAmount;
        String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DEMOPICK-" + orderCode;

        return new CheckoutResponse(
                orderCode,
                totalAmount,
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "momo",
                payUrl,
                qrCodeUrl
        );
    }

    public Order getOrderByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng.", HttpStatus.NOT_FOUND));
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public boolean handleMoMoWebhook(Map<String, Object> payload) {
        try {
            String orderCode = (String) payload.get("orderId");
            Integer resultCode = (Integer) payload.get("resultCode");

            log.info("Received MoMo Webhook for order: {}, resultCode: {}", orderCode, resultCode);

            if (orderCode == null) return false;

            Order order = orderRepository.findByOrderCode(orderCode).orElse(null);
            if (order == null) {
                log.warn("Order not found for MoMo Webhook: {}", orderCode);
                return false;
            }

            // Idempotency: if already marked paid, return true immediately
            if ("paid".equalsIgnoreCase(order.getPaymentStatus())) {
                log.info("Order {} is already marked as PAID. Skipping duplicate processing.", orderCode);
                return true;
            }

            if (resultCode != null && resultCode == 0) {
                order.setPaymentStatus("paid");
                order.setStatus("confirmed");
                orderRepository.save(order);

                // Convert any booking slots in this order to 'booked'
                List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                for (OrderItem item : items) {
                    if ("booking_slot".equalsIgnoreCase(item.getItemType()) && item.getReferenceId() != null) {
                        TimeSlot slot = timeSlotRepository.findById(item.getReferenceId()).orElse(null);
                        if (slot != null) {
                            slot.setStatus("booked");
                            timeSlotRepository.save(slot);
                            log.info("Updated slot {} to BOOKED from MoMo Webhook", slot.getId());
                        }
                    }
                }
                return true;
            } else {
                order.setPaymentStatus("unpaid");
                orderRepository.save(order);
                return false;
            }
        } catch (Exception ex) {
            log.error("Error processing MoMo Webhook", ex);
            return false;
        }
    }
}
