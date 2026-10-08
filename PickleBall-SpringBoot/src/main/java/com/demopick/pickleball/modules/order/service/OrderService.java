package com.demopick.pickleball.modules.order.service;

import com.demopick.pickleball.common.exception.ApiException;
import com.demopick.pickleball.modules.booking.entity.Hold;
import com.demopick.pickleball.modules.booking.entity.TimeSlot;
import com.demopick.pickleball.modules.booking.repository.HoldRepository;
import com.demopick.pickleball.modules.booking.repository.TimeSlotRepository;
import com.demopick.pickleball.modules.order.dto.CheckoutRequest;
import com.demopick.pickleball.modules.order.dto.CheckoutResponse;
import com.demopick.pickleball.modules.order.dto.CreateOrderRequest;
import com.demopick.pickleball.modules.order.dto.CreateOrderResponse;
import com.demopick.pickleball.modules.order.entity.Order;
import com.demopick.pickleball.modules.order.entity.OrderItem;
import com.demopick.pickleball.modules.order.repository.OrderItemRepository;
import com.demopick.pickleball.modules.order.repository.OrderRepository;
import com.demopick.pickleball.modules.shop.entity.ProductVariant;
import com.demopick.pickleball.modules.shop.entity.Voucher;
import com.demopick.pickleball.modules.shop.repository.ProductVariantRepository;
import com.demopick.pickleball.modules.shop.repository.VoucherRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
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
    private final VoucherRepository voucherRepository;

    @Value("${momo.secret-key}")
    private String momoSecretKey;

    @Value("${momo.gateway-url:http://localhost:5173/payment/momo/gateway}")
    private String momoGatewayUrl;

    @Value("${momo.redirect-url}")
    private String momoRedirectUrl;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        TimeSlotRepository timeSlotRepository,
                        HoldRepository holdRepository,
                        ProductVariantRepository productVariantRepository,
                        VoucherRepository voucherRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.holdRepository = holdRepository;
        this.productVariantRepository = productVariantRepository;
        this.voucherRepository = voucherRepository;
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

        BigDecimal subtotal = totalAmount;
        BigDecimal discountAmount = BigDecimal.ZERO;

        // Apply voucher if provided
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            String vCode = request.getVoucherCode().trim();
            Voucher voucher = voucherRepository.findByCode(vCode).orElse(null);
            if (voucher == null || !Boolean.TRUE.equals(voucher.getIsActive())) {
                throw new ApiException("Mã giảm giá không tồn tại hoặc đã bị khóa.", HttpStatus.BAD_REQUEST);
            }

            if (voucher.getMinOrderAmount() != null && subtotal.compareTo(BigDecimal.valueOf(voucher.getMinOrderAmount())) < 0) {
                throw new ApiException("Đơn hàng chưa đạt giá trị tối thiểu " + voucher.getMinOrderAmount().longValue() + "đ để sử dụng mã này.", HttpStatus.BAD_REQUEST);
            }

            if (voucher.getUsageLimit() != null && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                throw new ApiException("Mã giảm giá đã hết lượt sử dụng.", HttpStatus.BAD_REQUEST);
            }

            if ("percentage".equalsIgnoreCase(voucher.getDiscountType())) {
                BigDecimal pct = BigDecimal.valueOf(voucher.getDiscountValue() != null ? voucher.getDiscountValue() : 0);
                BigDecimal calc = subtotal.multiply(pct).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                if (voucher.getMaxDiscount() != null && voucher.getMaxDiscount() > 0) {
                    calc = calc.min(BigDecimal.valueOf(voucher.getMaxDiscount()));
                }
                discountAmount = calc;
            } else {
                discountAmount = BigDecimal.valueOf(voucher.getDiscountValue() != null ? voucher.getDiscountValue() : 0);
            }

            if (discountAmount.compareTo(subtotal) > 0) {
                discountAmount = subtotal;
            }

            voucher.setUsedCount((voucher.getUsedCount() != null ? voucher.getUsedCount() : 0) + 1);
            voucherRepository.save(voucher);
        }

        BigDecimal finalTotal = subtotal.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        // 3. Create Order
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String orderCode = "ORD-" + datePrefix + "-" + (int) (1000 + Math.random() * 9000);

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setUserId(userId);
        order.setOrderType(orderType);
        order.setSubtotal(subtotal);
        order.setDiscount(discountAmount);
        order.setTotalAmount(finalTotal);
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
        String baseUrl = (momoGatewayUrl != null && !momoGatewayUrl.isBlank()) ? momoGatewayUrl : momoRedirectUrl;
        String payUrl = baseUrl + "?orderId=" + orderCode + "&amount=" + finalTotal;
        String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DEMOPICK-" + orderCode;

        return new CheckoutResponse(
                orderCode,
                finalTotal,
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "momo",
                payUrl,
                qrCodeUrl
        );
    }

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request, Long userId) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> itemsToSave = new ArrayList<>();
        String orderType = "shop";

        // 1. Process Order Items
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateOrderRequest.CreateOrderItemDto item : request.getItems()) {
                int qty = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;
                BigDecimal price = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
                BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(qty));
                totalAmount = totalAmount.add(itemTotal);

                OrderItem prodItem = new OrderItem();
                prodItem.setItemType("product");
                prodItem.setReferenceId(item.getProductId() != null ? item.getProductId() : (item.getId() != null ? item.getId() : 0L));
                prodItem.setItemName(item.getName() != null && !item.getName().trim().isEmpty() ? item.getName() : "Sản phẩm Pickleball");
                prodItem.setQuantity(qty);
                prodItem.setUnitPrice(price);
                prodItem.setTotalPrice(itemTotal);
                itemsToSave.add(prodItem);

                // Try to decrease stock if a matching variant exists
                Long variantId = item.getProductId() != null ? item.getProductId() : item.getId();
                if (variantId != null) {
                    try {
                        ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);
                        if (variant != null && variant.getStockQty() != null && variant.getStockQty() >= qty) {
                            variant.setStockQty(variant.getStockQty() - qty);
                            productVariantRepository.save(variant);
                        }
                    } catch (Exception ex) {
                        log.warn("Could not decrement stock for variant ID {}: {}", variantId, ex.getMessage());
                    }
                }
            }
        }

        // 2. Process Booking Hold if provided
        Hold holdToConvert = null;
        if (request.getHoldId() != null || request.getSlotId() != null) {
            orderType = itemsToSave.isEmpty() ? "booking" : "mixed";
            Long holdId = request.getHoldId();
            Long slotId = request.getSlotId();

            Hold hold = null;
            if (holdId != null) {
                hold = holdRepository.findById(holdId).orElse(null);
            }
            if (hold == null && slotId != null) {
                hold = holdRepository.findBySlotIdAndStatusAndExpiresAtAfter(slotId, "active", LocalDateTime.now()).orElse(null);
            }

            if (hold != null) {
                holdToConvert = hold;
                if (slotId == null) {
                    slotId = hold.getSlotId();
                }
            }

            if (slotId != null) {
                TimeSlot slot = timeSlotRepository.findById(slotId).orElse(null);
                if (slot != null) {
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
            }
        }

        BigDecimal subtotal = totalAmount;
        BigDecimal discountAmount = BigDecimal.ZERO;

        // 3. Process Voucher if provided
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            String vCode = request.getVoucherCode().trim();
            Voucher voucher = voucherRepository.findByCode(vCode).orElse(null);
            if (voucher != null && Boolean.TRUE.equals(voucher.getIsActive())) {
                if ("percentage".equalsIgnoreCase(voucher.getDiscountType())) {
                    BigDecimal pct = BigDecimal.valueOf(voucher.getDiscountValue() != null ? voucher.getDiscountValue() : 0);
                    BigDecimal calc = subtotal.multiply(pct).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
                    if (voucher.getMaxDiscount() != null && voucher.getMaxDiscount() > 0) {
                        calc = calc.min(BigDecimal.valueOf(voucher.getMaxDiscount()));
                    }
                    discountAmount = calc;
                } else {
                    discountAmount = BigDecimal.valueOf(voucher.getDiscountValue() != null ? voucher.getDiscountValue() : 0);
                }
                if (discountAmount.compareTo(subtotal) > 0) {
                    discountAmount = subtotal;
                }
                voucher.setUsedCount((voucher.getUsedCount() != null ? voucher.getUsedCount() : 0) + 1);
                voucherRepository.save(voucher);
            }
        } else if (request.getDiscount() != null && request.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            discountAmount = request.getDiscount();
        }

        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal finalTotal = subtotal.subtract(discountAmount).add(shippingFee).max(BigDecimal.ZERO);

        // 4. Create Order
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String orderCode = "ORD-" + datePrefix + "-" + (int) (1000 + Math.random() * 9000);

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setUserId(userId);
        order.setCustomerName(request.getShippingName());
        order.setCustomerPhone(request.getShippingPhone());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "momo");
        order.setOrderType(orderType);
        order.setSubtotal(subtotal);
        order.setDiscount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(finalTotal);
        order.setStatus("pending");
        order.setPaymentStatus("unpaid");

        order = orderRepository.save(order);

        for (OrderItem item : itemsToSave) {
            item.setOrder(order);
            item.setOrderId(order.getId());
            orderItemRepository.save(item);
        }

        // Convert hold so auto-release cronjob does not expire it
        if (holdToConvert != null) {
            holdToConvert.setStatus("converted");
            holdRepository.save(holdToConvert);
        }

        // 5. Generate URLs
        String payUrl = null;
        if ("momo".equalsIgnoreCase(request.getPaymentMethod())) {
            String baseUrl = (momoGatewayUrl != null && !momoGatewayUrl.isBlank()) ? momoGatewayUrl : momoRedirectUrl;
            payUrl = baseUrl + "?orderId=" + orderCode + "&amount=" + finalTotal;
        }
        String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=DEMOPICK-" + orderCode;

        return new CreateOrderResponse(
                orderCode,
                finalTotal,
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "momo",
                "unpaid",
                payUrl,
                qrCodeUrl
        );
    }

    public Order getOrderByCode(String orderCode) {
        try {
            Long orderId = Long.parseLong(orderCode);
            Optional<Order> byId = orderRepository.findById(orderId);
            if (byId.isPresent()) return byId.get();
        } catch (NumberFormatException ignored) {}

        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng: " + orderCode, HttpStatus.NOT_FOUND));
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public boolean verifyMomoPayment(Map<String, Object> payload) {
        try {
            if (payload == null) return false;

            Object rawOrderId = payload.get("orderId");
            if (rawOrderId == null) rawOrderId = payload.get("orderCode");
            if (rawOrderId == null) return false;

            String fullOrderId = String.valueOf(rawOrderId);
            String orderCode = fullOrderId.split("_")[0];

            Object rawResultCode = payload.get("resultCode");
            String resultCodeStr = rawResultCode != null ? String.valueOf(rawResultCode) : "-1";
            boolean isSuccess = "0".equals(resultCodeStr);

            log.info("Verifying MoMo Payment for order: {} (raw: {}), resultCode: {}", orderCode, fullOrderId, resultCodeStr);

            Order order = orderRepository.findByOrderCode(orderCode)
                    .or(() -> orderRepository.findByOrderCode(fullOrderId))
                    .orElse(null);

            if (order == null) {
                log.warn("Order not found during MoMo verification: {}", orderCode);
                return false;
            }

            // If already marked as paid, return true immediately
            if ("paid".equalsIgnoreCase(order.getPaymentStatus())) {
                log.info("Order {} is already marked as PAID.", orderCode);
                return true;
            }

            if (isSuccess) {
                order.setPaymentStatus("paid");
                order.setStatus("confirmed");
                orderRepository.save(order);

                // Convert associated booking slots to 'booked'
                List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                for (OrderItem item : items) {
                    if ("booking_slot".equalsIgnoreCase(item.getItemType()) && item.getReferenceId() != null) {
                        TimeSlot slot = timeSlotRepository.findById(item.getReferenceId()).orElse(null);
                        if (slot != null) {
                            slot.setStatus("booked");
                            timeSlotRepository.save(slot);
                            log.info("Updated slot {} to BOOKED from MoMo payment verify", slot.getId());
                        }
                    }
                }
                return true;
            } else {
                order.setPaymentStatus("unpaid");
                orderRepository.save(order);

                // Release any held court slots back to 'available' immediately
                List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                for (OrderItem item : items) {
                    if ("booking_slot".equalsIgnoreCase(item.getItemType()) && item.getReferenceId() != null) {
                        TimeSlot slot = timeSlotRepository.findById(item.getReferenceId()).orElse(null);
                        if (slot != null && !"booked".equalsIgnoreCase(slot.getStatus())) {
                            slot.setStatus("available");
                            timeSlotRepository.save(slot);
                            log.info("Released slot {} back to AVAILABLE because MoMo payment failed/cancelled", slot.getId());
                        }
                        List<Hold> holds = holdRepository.findBySlotId(item.getReferenceId());
                        for (Hold h : holds) {
                            h.setStatus("expired");
                            holdRepository.save(h);
                        }
                    }
                }
                return false;
            }
        } catch (Exception ex) {
            log.error("Error verifying MoMo payment", ex);
            return false;
        }
    }

    @Transactional
    public Order cancelOrder(String orderCode, String reason, Long userId) {
        Order order = null;
        try {
            Long orderId = Long.parseLong(orderCode);
            order = orderRepository.findById(orderId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (order == null) {
            order = orderRepository.findByOrderCode(orderCode)
                    .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng: " + orderCode, HttpStatus.NOT_FOUND));
        }

        if ("cancelled".equalsIgnoreCase(order.getStatus())) {
            return order;
        }

        order.setStatus("cancelled");
        if (reason != null && !reason.isBlank()) {
            order.setPickupNotes(order.getPickupNotes() != null ? order.getPickupNotes() + " | Lý do: " + reason : "Lý do hủy: " + reason);
        }
        order = orderRepository.save(order);

        // 1. Release court slots back to 'available'
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : items) {
            if ("booking_slot".equalsIgnoreCase(item.getItemType()) && item.getReferenceId() != null) {
                TimeSlot slot = timeSlotRepository.findById(item.getReferenceId()).orElse(null);
                if (slot != null && !"booked".equalsIgnoreCase(slot.getStatus())) {
                    slot.setStatus("available");
                    timeSlotRepository.save(slot);
                    log.info("Released slot {} back to AVAILABLE upon order cancellation {}", slot.getId(), order.getOrderCode());
                }
                List<Hold> holds = holdRepository.findBySlotId(item.getReferenceId());
                for (Hold h : holds) {
                    h.setStatus("expired");
                    holdRepository.save(h);
                }
            } else if ("product".equalsIgnoreCase(item.getItemType()) && item.getReferenceId() != null) {
                // Restock product variant
                ProductVariant variant = productVariantRepository.findById(item.getReferenceId()).orElse(null);
                if (variant != null && item.getQuantity() != null) {
                    variant.setStockQty(variant.getStockQty() + item.getQuantity());
                    productVariantRepository.save(variant);
                }
            }
        }

        return order;
    }

    @Transactional
    public Order updateOrderStatus(String idOrCode, String newStatus) {
        if (newStatus == null || newStatus.isBlank()) {
            throw new ApiException("Trạng thái đơn hàng không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        Order order = null;
        try {
            Long orderId = Long.parseLong(idOrCode);
            order = orderRepository.findById(orderId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (order == null) {
            order = orderRepository.findByOrderCode(idOrCode)
                    .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng: " + idOrCode, HttpStatus.NOT_FOUND));
        }

        String normalizedStatus = newStatus.trim().toLowerCase();
        if (normalizedStatus.contains("hủy") || normalizedStatus.contains("cancel")) {
            return cancelOrder(order.getOrderCode(), "Quản trị viên cập nhật trạng thái hủy", null);
        }

        if (normalizedStatus.contains("hoàn") || normalizedStatus.contains("refund")) {
            order.setStatus("refunded");
            order.setPaymentStatus("refunded");
        } else if (normalizedStatus.contains("xác nhận") || normalizedStatus.contains("confirm")) {
            order.setStatus("confirmed");
        } else if (normalizedStatus.contains("giao") || normalizedStatus.contains("ship")) {
            order.setStatus("shipping");
        } else if (normalizedStatus.contains("hoàn tất") || normalizedStatus.contains("complete")) {
            order.setStatus("completed");
        } else {
            order.setStatus(normalizedStatus);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order confirmRefund(String orderCode, String refundTransId, String refundNote) {
        Order order = null;
        try {
            Long orderId = Long.parseLong(orderCode);
            order = orderRepository.findById(orderId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (order == null) {
            order = orderRepository.findByOrderCode(orderCode)
                    .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng: " + orderCode, HttpStatus.NOT_FOUND));
        }

        order.setStatus("refunded");
        order.setPaymentStatus("refunded");
        String note = "Hoàn tiền thành công.";
        if (refundTransId != null && !refundTransId.isBlank()) note += " Mã GD hoàn: " + refundTransId;
        if (refundNote != null && !refundNote.isBlank()) note += " (" + refundNote + ")";
        order.setPickupNotes(order.getPickupNotes() != null ? order.getPickupNotes() + " | " + note : note);

        // Also release any court slots
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : items) {
            if ("booking_slot".equalsIgnoreCase(item.getItemType()) && item.getReferenceId() != null) {
                TimeSlot slot = timeSlotRepository.findById(item.getReferenceId()).orElse(null);
                if (slot != null && !"available".equalsIgnoreCase(slot.getStatus())) {
                    slot.setStatus("available");
                    timeSlotRepository.save(slot);
                    log.info("Released slot {} back to AVAILABLE upon refund for order {}", slot.getId(), order.getOrderCode());
                }
            }
        }

        return orderRepository.save(order);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoReleaseUnpaidOrderSlots() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<Order> expiredOrders = orderRepository.findAll().stream()
                .filter(o -> "pending".equalsIgnoreCase(o.getStatus())
                        && "unpaid".equalsIgnoreCase(o.getPaymentStatus())
                        && o.getCreatedAt() != null
                        && o.getCreatedAt().isBefore(cutoff))
                .toList();

        for (Order order : expiredOrders) {
            log.info("Auto cancelling timed-out unpaid order: {}", order.getOrderCode());
            try {
                cancelOrder(order.getOrderCode(), "Hết thời gian chờ thanh toán (15 phút)", null);
            } catch (Exception ex) {
                log.error("Failed to auto cancel expired order {}", order.getOrderCode(), ex);
            }
        }
    }

    @Transactional
    public boolean handleMoMoWebhook(Map<String, Object> payload) {
        log.info("Received MoMo Webhook payload: {}", payload);
        return verifyMomoPayment(payload);
    }
}
