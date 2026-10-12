package com.demopick.pickleball.common.service;

import com.demopick.pickleball.modules.order.entity.Order;
import com.demopick.pickleball.modules.order.entity.OrderItem;
import com.demopick.pickleball.modules.user.entity.User;
import com.demopick.pickleball.modules.user.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Properties;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${spring.mail.username:nvmtein@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:rsaegcuzmnruldjs}")
    private String mailPassword;

    @Value("${mail.from.address:nvmtein@gmail.com}")
    private String fromAddress;

    @Value("${mail.from.name:Pickleball}")
    private String fromName;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender,
                        UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    /**
     * Lấy JavaMailSender từ Spring Context, hoặc tự động khởi tạo theo Gmail SMTP nếu Spring Context chưa cấu hình
     */
    private JavaMailSender getMailSender() {
        if (this.mailSender != null) {
            return this.mailSender;
        }
        JavaMailSenderImpl impl = new JavaMailSenderImpl();
        impl.setHost("smtp.gmail.com");
        impl.setPort(587);
        impl.setUsername((mailUsername != null && !mailUsername.isBlank()) ? mailUsername : "nvmtein@gmail.com");
        impl.setPassword((mailPassword != null && !mailPassword.isBlank()) ? mailPassword : "rsaegcuzmnruldjs");
        Properties props = impl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        return impl;
    }

    /**
     * Helper gửi email HTML qua SMTP với cơ chế mô phỏng an toàn (fallback)
     */
    private boolean sendHtmlEmail(String recipientEmail, String subject, String htmlContent, String contextDesc) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.info("Không có email người nhận để gửi {}: {}", contextDesc, subject);
            return false;
        }

        String effectiveFrom = (fromAddress != null && !fromAddress.isBlank()) ? fromAddress : "nvmtein@gmail.com";
        String effectiveName = (fromName != null && !fromName.isBlank()) ? fromName : "Pickleball";

        try {
            JavaMailSender sender = getMailSender();
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(effectiveFrom, effectiveName);
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            sender.send(message);
            log.info("ĐÃ GỬI EMAIL THẬT THÀNH CÔNG [{}] tới {}", contextDesc, recipientEmail);
            return true;
        } catch (Exception ex) {
            log.warn("Không thể gửi email qua SMTP ({}) tới {}: {}. Chuyển sang ghi nhận mô phỏng.",
                    effectiveFrom, recipientEmail, ex.getMessage());
        }

        // Chế độ mô phỏng / Development log (khi chưa cấu hình hoặc SMTP bận)
        log.info("""
                ================================================================================
                [EMAIL NOTIFICATION SIMULATION - {}]
                Gửi tới: {}
                Tiêu đề: {}
                Ghi chú: Cấu hình MAIL_PASSWORD trong .env để chuyển từ mô phỏng sang gửi email thật.
                ================================================================================
                """, contextDesc, recipientEmail, subject);

        return true;
    }

    /**
     * 1. Gửi email xác nhận thanh toán / đặt hàng thành công
     */
    @Async
    public boolean sendPaymentSuccessEmail(Order order, List<OrderItem> items) {
        if (order == null) return false;

        String recipientEmail = resolveCustomerEmail(order);
        if (recipientEmail == null) return false;

        String customerName = order.getCustomerName() != null ? order.getCustomerName() : "Quý khách";
        String orderCode = order.getOrderCode();
        String paymentMethod = formatPaymentMethod(order.getPaymentMethod());
        String totalFormatted = formatCurrency(order.getTotalAmount());
        String subtotalFormatted = formatCurrency(order.getSubtotal());
        String discountFormatted = formatCurrency(order.getDiscount());
        String shippingFeeFormatted = formatCurrency(order.getShippingFee());
        String orderTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));

        String subject = "🏸 [Pickleball] Xác nhận thanh toán thành công cho đơn hàng #" + orderCode;
        String htmlContent = buildPaymentSuccessTemplate(
                customerName,
                orderCode,
                orderTime,
                paymentMethod,
                order.getShippingAddress(),
                order.getCustomerPhone(),
                items,
                subtotalFormatted,
                discountFormatted,
                shippingFeeFormatted,
                totalFormatted
        );

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "Xác nhận đặt hàng #" + orderCode);
    }

    /**
     * 2. Gửi email cập nhật tiến trình đơn hàng theo từng giai đoạn
     * (Chuẩn bị hàng, Đang vận chuyển GHN kèm mã vận đơn, Giao thành công, Hoàn tiền/Hủy)
     */
    @Async
    public boolean sendOrderStatusUpdateEmail(Order order, String newStatus, String trackingCode) {
        if (order == null) return false;

        String recipientEmail = resolveCustomerEmail(order);
        if (recipientEmail == null) return false;

        String customerName = order.getCustomerName() != null ? order.getCustomerName() : "Quý khách";
        String orderCode = order.getOrderCode();
        String totalFormatted = formatCurrency(order.getTotalAmount());
        String updateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));

        String statusBadgeText;
        String statusDescription;
        String subject;
        String stepColor = "#10B981";

        String norm = newStatus != null ? newStatus.toLowerCase().trim() : "";
        if (norm.contains("ship") || norm.contains("giao") || norm.contains("delivering")) {
            subject = "🚚 [Pickleball] Đơn hàng #" + orderCode + " đang trên đường giao đến bạn";
            statusBadgeText = "ĐANG VẬN CHUYỂN";
            statusDescription = "Kiện hàng đã được bàn giao cho đối tác vận chuyển Giao Hàng Nhanh (GHN Express) và đang trên đường giao tới bạn.";
            stepColor = "#3B82F6";
        } else if (norm.contains("complete") || norm.contains("done") || norm.contains("hoàn tất") || norm.contains("delivered")) {
            subject = "🎉 [Pickleball] Đơn hàng #" + orderCode + " đã được giao thành công";
            statusBadgeText = "GIAO THÀNH CÔNG";
            statusDescription = "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã tin tưởng và đồng hành cùng Pickleball Club!";
            stepColor = "#10B981";
        } else if (norm.contains("confirm") || norm.contains("prepar") || norm.contains("chuẩn bị") || norm.contains("xác nhận")) {
            subject = "📦 [Pickleball] Đơn hàng #" + orderCode + " đang được đóng gói chuẩn bị";
            statusBadgeText = "ĐANG CHUẨN BỊ HÀNG";
            statusDescription = "Đội ngũ kho vận đang kiểm tra chất lượng sản phẩm và đóng gói cẩn thận đơn hàng của bạn.";
            stepColor = "#F59E0B";
        } else if (norm.contains("cancel") || norm.contains("refund") || norm.contains("hủy")) {
            subject = "ℹ️ [Pickleball] Thông báo trạng thái đơn hàng #" + orderCode;
            statusBadgeText = "ĐÃ HỦY / HOÀN TIỀN";
            statusDescription = "Đơn hàng #" + orderCode + " đã được hủy hoặc hoàn tiền. Nếu có thắc mắc, vui lòng liên hệ hotline 1900 8888 để được hỗ trợ.";
            stepColor = "#EF4444";
        } else {
            subject = "📋 [Pickleball] Cập nhật tiến trình đơn hàng #" + orderCode;
            statusBadgeText = newStatus.toUpperCase();
            statusDescription = "Trạng thái đơn hàng của bạn đã được cập nhật sang: " + newStatus;
        }

        String trackingHtml = "";
        if (trackingCode != null && !trackingCode.isBlank()) {
            trackingHtml = String.format("""
                <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px; margin: 20px 0;">
                    <div style="color: #1D4ED8; font-size: 13px; font-weight: bold; margin-bottom: 6px;">ĐƠN VỊ VẬN CHUYỂN: GHN EXPRESS</div>
                    <div style="font-size: 14px; color: #1E3A8A;">Mã vận đơn: <strong style="font-family: monospace; font-size: 15px;">%s</strong></div>
                    <div style="margin-top: 10px;">
                        <a href="https://tracking.ghn.vn/?order_code=%s" target="_blank"
                           style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-size: 12px; font-weight: bold; padding: 8px 16px; border-radius: 8px; text-decoration: none;">
                            🔍 Tra Cứu Hành Trình GHN
                        </a>
                    </div>
                </div>
                """, escapeHtml(trackingCode), escapeHtml(trackingCode));
        }

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Cập nhật trạng thái đơn hàng</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 28px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="margin-bottom: 8px;">
                                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; filter: brightness(0) invert(1);" />
                                        </div>
                                        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">PICKLEBALL CLUB</h1>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Cập Nhật Tiến Trình Đơn Hàng</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px 28px;">
                                        <p style="font-size: 15px; color: #334155; margin: 0 0 12px 0;">Kính gửi <strong>%s</strong>,</p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">%s</p>

                                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                                            <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                                                <tr>
                                                    <td style="color: #64748B; padding-bottom: 8px;">Mã đơn hàng:</td>
                                                    <td align="right" style="font-weight: bold; font-family: monospace; color: #0F172A; padding-bottom: 8px;">#%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #64748B; padding-bottom: 8px;">Thời gian cập nhật:</td>
                                                    <td align="right" style="color: #334155; padding-bottom: 8px;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #64748B; padding-bottom: 8px;">Tổng thanh toán:</td>
                                                    <td align="right" style="font-weight: bold; color: #059669; padding-bottom: 8px;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #64748B;">Trạng thái hiện tại:</td>
                                                    <td align="right">
                                                        <span style="background-color: %s; color: #FFFFFF; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px;">
                                                             %s
                                                        </span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>

                                        %s

                                        <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748B; text-align: center; line-height: 1.5;">
                                            Cần trợ giúp đơn hàng? Phản hồi trực tiếp email này hoặc gọi hotline <strong>1900 8888</strong>.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 16px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
                escapeHtml(customerName),
                escapeHtml(statusDescription),
                escapeHtml(orderCode),
                updateTime,
                totalFormatted,
                stepColor,
                escapeHtml(statusBadgeText),
                trackingHtml
        );

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "Cập nhật đơn #" + orderCode + " -> " + newStatus);
    }

    /**
     * 3. Gửi email Chào mừng khi User Đăng ký tài khoản mới (Welcome Email)
     */
    @Async
    public boolean sendWelcomeEmail(User user) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) return false;

        String recipientEmail = user.getEmail().trim();
        String name = user.getName() != null && !user.getName().isBlank() ? user.getName() : "Vận động viên mới";
        String subject = "🌟 Chào mừng bạn gia nhập CLB Pickleball!";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Chào mừng thành viên mới</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 36px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="margin-bottom: 8px;">
                                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; filter: brightness(0) invert(1);" />
                                        </div>
                                        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">CHÀO MỪNG ĐẾN VỚI PICKLEBALL CLUB!</h1>
                                        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95;">Sân Chơi & Thiết Bị Thể Thao Hàng Đầu</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px 28px;">
                                        <p style="font-size: 16px; color: #1E293B; margin: 0 0 14px 0;">Xin chào <strong>%s</strong>,</p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                                            Tài khoản của bạn đã được khởi tạo thành công tại hệ thống <strong>Pickleball Club</strong>. Bây giờ bạn có thể trải nghiệm toàn bộ tiện ích:
                                        </p>

                                        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                                            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #166534; line-height: 1.8;">
                                                <li><strong>Đặt sân trực tuyến 24/7:</strong> Giữ khung giờ yêu thích, không lo trùng lịch.</li>
                                                <li><strong>Pro Shop Chính Hãng:</strong> Mua vợt cao cấp, bóng tiêu chuẩn USAPA và phụ kiện.</li>
                                                <li><strong>Tích điểm thành viên:</strong> Nhận ưu đãi voucher giảm giá độc quyền cho các trận đấu.</li>
                                            </ul>
                                        </div>

                                        <div style="text-align: center; margin: 30px 0;">
                                            <a href="https://pickleball-manhtien.vercel.app/booking" target="_blank"
                                               style="display: inline-block; background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); color: #FFFFFF; font-size: 14px; font-weight: bold; padding: 12px 28px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                                🚀 Khám Phá & Đặt Sân Ngay
                                            </a>
                                        </div>

                                        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
                                            Email tài khoản: <strong>%s</strong>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 16px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """, escapeHtml(name), escapeHtml(recipientEmail));

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "Chào mừng đăng ký: " + recipientEmail);
    }

    /**
     * 4. Gửi email Cảnh báo bảo mật khi Người dùng Đăng nhập mới (Login Security Alert)
     */
    @Async
    public boolean sendLoginAlertEmail(User user, String ipAddress, String userAgent) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) return false;

        String recipientEmail = user.getEmail().trim();
        String name = user.getName() != null && !user.getName().isBlank() ? user.getName() : "Người dùng";
        String loginTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss - dd/MM/yyyy"));
        String ip = ipAddress != null && !ipAddress.isBlank() ? ipAddress : "Không xác định";
        String device = userAgent != null && !userAgent.isBlank() ? userAgent : "Trình duyệt web tiêu chuẩn";

        String subject = "🔐 [Cảnh báo bảo mật] Đăng nhập mới vào tài khoản Pickleball";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Thông báo đăng nhập</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background-color: #1E293B; padding: 24px; text-align: center; color: #FFFFFF;">
                                        <div style="font-size: 28px; margin-bottom: 6px;">🛡️</div>
                                        <h1 style="margin: 0; font-size: 18px; font-weight: 700;">THÔNG BÁO BẢO MẬT TÀI KHOẢN</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 28px;">
                                        <p style="font-size: 14px; color: #334155; margin: 0 0 14px 0;">Xin chào <strong>%s</strong>,</p>
                                        <p style="font-size: 13px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                                            Chúng tôi ghi nhận một lượt đăng nhập thành công vào tài khoản của bạn với chi tiết như sau:
                                        </p>

                                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; font-size: 13px; color: #334155; line-height: 1.8;">
                                            <div><strong>Thời gian:</strong> %s</div>
                                            <div><strong>Địa chỉ IP:</strong> %s</div>
                                            <div style="word-break: break-all;"><strong>Thiết bị:</strong> %s</div>
                                        </div>

                                        <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px; margin-top: 20px; font-size: 12px; color: #92400E; line-height: 1.5;">
                                            ⚠️ <strong>Lưu ý bảo mật:</strong> Nếu đây không phải là bạn, vui lòng liên hệ quản trị viên hoặc thực hiện chức năng đổi mật khẩu ngay lập tức để bảo vệ tài khoản.
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 14px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """, escapeHtml(name), loginTime, escapeHtml(ip), escapeHtml(device));

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "Cảnh báo đăng nhập: " + recipientEmail);
    }

    /**
     * 5. Gửi email Xác nhận Đặt Sân thành công (Vé Điện Tử - Court Booking Ticket)
     */
    @Async
    public boolean sendCourtBookingSuccessEmail(Order order, List<OrderItem> bookingItems) {
        if (order == null || bookingItems == null || bookingItems.isEmpty()) return false;

        String recipientEmail = resolveCustomerEmail(order);
        if (recipientEmail == null) return false;

        String customerName = order.getCustomerName() != null ? order.getCustomerName() : "Quý khách";
        String orderCode = order.getOrderCode();
        String totalFormatted = formatCurrency(order.getTotalAmount());
        String subject = "🎟️ [Pickleball] Xác nhận vé đặt sân thành công - Mã đơn #" + orderCode;

        StringBuilder slotsHtml = new StringBuilder();
        for (OrderItem item : bookingItems) {
            String slotName = item.getItemName() != null ? item.getItemName() : "Khung giờ đặt sân";
            String price = formatCurrency(item.getTotalPrice());
            slotsHtml.append(String.format("""
                <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
                    <div style="font-weight: bold; font-size: 14px; color: #166534;">🏸 %s</div>
                    <div style="font-size: 12px; color: #15803D; margin-top: 4px;">Giá thuê: <strong>%s</strong></div>
                </div>
                """, escapeHtml(slotName), price));
        }

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Vé đặt sân thành công</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 30px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="margin-bottom: 8px;">
                                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; filter: brightness(0) invert(1);" />
                                        </div>
                                        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">VÉ ĐẶT SÂN PICKLEBALL ĐIỆN TỬ</h1>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Mã Đơn: #%s</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 28px;">
                                        <p style="font-size: 15px; color: #1E293B; margin: 0 0 12px 0;">Kính gửi <strong>%s</strong>,</p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                                            Yêu cầu đặt sân của bạn đã được hệ thống xác nhận và giữ chỗ thành công. Chi tiết ca chơi của bạn như sau:
                                        </p>

                                        <h3 style="font-size: 13px; text-transform: uppercase; color: #64748B; margin: 0 0 10px 0; letter-spacing: 0.5px;">Danh Sách Ca Chơi Đã Giữ:</h3>
                                        %s

                                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin: 20px 0;">
                                            <div style="font-size: 13px; font-weight: bold; color: #0F172A; margin-bottom: 10px;">📋 LƯU Ý KHI ĐẾN SÂN:</div>
                                            <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.8;">
                                                <li>Vui lòng có mặt tại sân trước giờ chơi <strong>10 - 15 phút</strong> để làm thủ tục check-in và khởi động.</li>
                                                <li>Xuất trình mã đơn <strong>#%s</strong> hoặc số điện thoại <strong>%s</strong> tại quầy lễ tân để nhận sân.</li>
                                                <li>CLB có sẵn dịch vụ thuê vợt cao cấp, bóng thi đấu và nước uống điện giải tại quầy Pro Shop.</li>
                                            </ul>
                                        </div>

                                        <div style="text-align: right; font-size: 15px; color: #1E293B; font-weight: bold; margin-top: 16px;">
                                            Tổng chi phí: <span style="color: #059669; font-size: 18px; font-weight: 800;">%s</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 16px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        Địa chỉ cụm sân: Số 188 Nguyễn Văn Cừ, Q. Long Biên, Hà Nội | Hotline: 1900 8888 | © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
                escapeHtml(orderCode),
                escapeHtml(customerName),
                slotsHtml.toString(),
                escapeHtml(orderCode),
                escapeHtml(order.getCustomerPhone() != null ? order.getCustomerPhone() : "đã đăng ký"),
                totalFormatted);

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "Vé đặt sân #" + orderCode);
    }

    /**
     * 6. Gửi email Nhắc nhở trước giờ chơi (Court Schedule Reminder)
     */
    @Async
    public boolean sendCourtReminderEmail(String recipientEmail, String customerName, String courtName,
                                          String dateStr, String timeRange, String orderCode) {
        if (recipientEmail == null || recipientEmail.isBlank()) return false;

        String name = customerName != null && !customerName.isBlank() ? customerName : "Bạn";
        String subject = "⏰ [Nhắc nhở] Sắp đến giờ chơi Pickleball tại " + courtName + " (" + timeRange + ")!";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Nhắc nhở giờ chơi</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #F59E0B 0%%, #D97706 100%%); padding: 30px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="font-size: 36px; margin-bottom: 6px;">⏰</div>
                                        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">SẮP ĐẾN GIỜ RA SÂN!</h1>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.95;">Chuẩn Bị Khởi Động & Ra Sân Thôi Nào</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px 28px;">
                                        <p style="font-size: 15px; color: #1E293B; margin: 0 0 12px 0;">Chào <strong>%s</strong>,</p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                                            Chỉ còn ít phút nữa là đến ca chơi Pickleball của bạn. Hãy sẵn sàng năng lượng để có những pha dink và smash bùng nổ nhé!
                                        </p>

                                        <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                                            <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #92400E;">
                                                <tr>
                                                    <td style="padding-bottom: 8px;"><strong>Cụm Sân:</strong></td>
                                                    <td align="right" style="padding-bottom: 8px; font-weight: bold;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 8px;"><strong>Ngày chơi:</strong></td>
                                                    <td align="right" style="padding-bottom: 8px;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 8px;"><strong>Khung giờ:</strong></td>
                                                    <td align="right" style="padding-bottom: 8px; font-weight: 800; font-size: 15px; color: #B45309;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Mã vé / Đơn:</strong></td>
                                                    <td align="right" style="font-family: monospace; font-weight: bold;">#%s</td>
                                                </tr>
                                            </table>
                                        </div>

                                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; font-size: 13px; color: #475569; line-height: 1.7;">
                                            💡 <strong>Checklist chuẩn bị nhanh:</strong>
                                            <ul style="margin: 6px 0 0 0; padding-left: 20px;">
                                                <li>Giày thể thao đế bám sân chuyên dụng.</li>
                                                <li>Vợt và bóng tập (hoặc thuê ngay tại quầy lễ tân).</li>
                                                <li>Khởi động khớp cổ chân, cổ tay và khớp vai trước 10 phút.</li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 16px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        Chúc bạn có những giờ thi đấu tràn đầy hứng khởi! Hotline sân: 1900 8888.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
                escapeHtml(name),
                escapeHtml(courtName),
                escapeHtml(dateStr),
                escapeHtml(timeRange),
                escapeHtml(orderCode != null ? orderCode : "BOOKING"));

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "Nhắc nhở ra sân: " + recipientEmail);
    }

    /**
     * 7. Gửi email Mã OTP Quên mật khẩu
     */
    @Async
    public boolean sendOtpResetPasswordEmail(String recipientEmail, String otp) {
        if (recipientEmail == null || recipientEmail.isBlank()) return false;

        String subject = "🔑 [Pickleball] Mã OTP đặt lại mật khẩu của bạn";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Mã OTP đặt lại mật khẩu</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 30px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="margin-bottom: 8px;">
                                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; filter: brightness(0) invert(1);" />
                                        </div>
                                        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">ĐẶT LẠI MẬT KHẨU TÀI KHOẢN</h1>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.95;">Pickleball Club & Pro Shop</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px 28px; text-align: center;">
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
                                            Bạn vừa yêu cầu mã xác nhận để đặt lại mật khẩu tài khoản. Mã OTP của bạn là:
                                        </p>

                                        <div style="display: inline-block; background-color: #F0FDF4; border: 2px dashed #059669; border-radius: 12px; padding: 14px 36px; margin-bottom: 20px;">
                                            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #059669; font-family: monospace;">%s</span>
                                        </div>

                                        <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0;">
                                            Mã OTP này có hiệu lực trong vòng <strong>10 phút</strong>.
                                        </p>
                                        <p style="font-size: 12px; color: #EF4444; margin: 0;">
                                            Tuyệt đối không cung cấp mã này cho bất kỳ ai để đảm bảo an toàn cho tài khoản.
                                        </p>
                                    </td>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 14px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """, escapeHtml(otp));

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "OTP Quên mật khẩu: " + recipientEmail);
    }

    /**
     * 7.1 Gửi email Mã OTP Xác thực Đăng ký tài khoản mới
     */
    @Async
    public boolean sendRegisterOtpEmail(String recipientEmail, String otp, String customerName) {
        if (recipientEmail == null || recipientEmail.isBlank()) return false;

        String name = customerName != null && !customerName.isBlank() ? customerName : "Bạn";
        String subject = "📩 [Pickleball] Mã OTP xác thực đăng ký tài khoản";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Xác thực đăng ký tài khoản</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 30px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="margin-bottom: 8px;">
                                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; filter: brightness(0) invert(1);" />
                                        </div>
                                        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">XÁC THỰC TÀI KHOẢN MỚI</h1>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.95;">Pickleball Club & Pro Shop</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px 28px; text-align: center;">
                                        <p style="font-size: 15px; color: #1E293B; margin: 0 0 12px 0;">Xin chào <strong>%s</strong>,</p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                                            Cảm ơn bạn đã đăng ký tài khoản tại <strong>Pickleball Club</strong>. Dưới đây là mã OTP 6 chữ số dùng để kích hoạt tài khoản của bạn:
                                        </p>

                                        <div style="display: inline-block; background-color: #F0FDF4; border: 2px dashed #059669; border-radius: 12px; padding: 14px 36px; margin-bottom: 20px;">
                                            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #059669; font-family: monospace;">%s</span>
                                        </div>

                                        <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0;">
                                            Mã xác thực có hiệu lực trong vòng <strong>10 phút</strong>.
                                        </p>
                                        <p style="font-size: 12px; color: #EF4444; margin: 0;">
                                            Vui lòng không cung cấp mã này cho người khác để bảo vệ an toàn cho tài khoản.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 14px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """, escapeHtml(name), escapeHtml(otp));

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "OTP Đăng ký: " + recipientEmail);
    }

    /**
     * 7.2 Gửi email Mã OTP Đăng nhập nhanh không cần mật khẩu
     */
    @Async
    public boolean sendLoginOtpEmail(String recipientEmail, String otp, String customerName) {
        if (recipientEmail == null || recipientEmail.isBlank()) return false;

        String name = customerName != null && !customerName.isBlank() ? customerName : "Bạn";
        String subject = "🔑 [Pickleball] Mã OTP đăng nhập tài khoản của bạn";

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Mã OTP đăng nhập tài khoản</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 30px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="margin-bottom: 8px;">
                                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; filter: brightness(0) invert(1);" />
                                        </div>
                                        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">MÃ OTP ĐĂNG NHẬP NHANH</h1>
                                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.95;">Pickleball Club & Pro Shop</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px 28px; text-align: center;">
                                        <p style="font-size: 15px; color: #1E293B; margin: 0 0 12px 0;">Xin chào <strong>%s</strong>,</p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                                            Bạn đang đăng nhập vào hệ thống bằng mã OTP một lần (không cần mật khẩu). Mã xác thực của bạn là:
                                        </p>

                                        <div style="display: inline-block; background-color: #F0FDF4; border: 2px dashed #059669; border-radius: 12px; padding: 14px 36px; margin-bottom: 20px;">
                                            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #059669; font-family: monospace;">%s</span>
                                        </div>

                                        <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0;">
                                            Mã có hiệu lực trong vòng <strong>10 phút</strong>.
                                        </p>
                                        <p style="font-size: 12px; color: #EF4444; margin: 0;">
                                            Nếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua thư này hoặc đổi mật khẩu.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 14px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """, escapeHtml(name), escapeHtml(otp));

        return sendHtmlEmail(recipientEmail, subject, htmlContent, "OTP Đăng nhập: " + recipientEmail);
    }

    /**
     * 8. Gửi email Kiểm thử kết nối SMTP trực tiếp
     */
    public boolean sendTestEmail(String recipientEmail) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            recipientEmail = "nvmtein@gmail.com";
        }
        String cleanEmail = recipientEmail.trim();
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
        String subject = "🏸 [Pickleball] Kiểm thử dịch vụ Email SMTP thành công!";
        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
                    <div style="margin-bottom: 10px;">
                        <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball Logo" width="56" height="56" style="width: 56px; height: 56px; display: inline-block; vertical-align: middle;" />
                    </div>
                    <h1 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">PICKLEBALL CLUB</h1>
                    <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Hệ Thống Sân & Dịch Vụ Thể Thao Tự Động</p>
                </div>
                <div style="padding: 24px 0;">
                    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                        <h3 style="color: #065f46; margin: 0 0 8px 0; font-size: 16px;">✅ KẾT NỐI SMTP THÀNH CÔNG!</h3>
                        <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.5;">
                            Thư điện tử này được gửi tự động từ máy chủ Backend Spring Boot thông qua giao thức <strong>Gmail SMTP</strong> (Cổng 587 - TLS).
                        </p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; color: #64748b;">Hòm thư gửi:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #1e293b; text-align: right;">nvmtein@gmail.com</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; color: #64748b;">Người nhận:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #1e293b; text-align: right;">""" + escapeHtml(cleanEmail) + """
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; color: #64748b;">Thời gian gửi:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #1e293b; text-align: right;">""" + now + """
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #64748b;">Trạng thái dịch vụ:</td>
                            <td style="padding: 10px 0; font-weight: bold; color: #10b981; text-align: right;">Đang hoạt động hoàn hảo (Online)</td>
                        </tr>
                    </table>
                    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                        Từ giờ, các tính năng sau sẽ tự động kích hoạt gửi email tới khách hàng:
                    </p>
                    <ul style="color: #475569; font-size: 13px; line-height: 1.8;">
                        <li>Hóa đơn điện tử khi thanh toán MoMo / Chuyển khoản thành công</li>
                        <li>Vé điện tử kèm mã QR check-in tự động tại sân</li>
                        <li>Thông báo cập nhật đơn hàng & mã vận đơn GHN Express</li>
                        <li>Mã xác thực OTP khi người dùng khôi phục mật khẩu</li>
                    </ul>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94A3B8;">
                    © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                </div>
            </div>
            """;
        return sendHtmlEmail(cleanEmail, subject, htmlContent, "Kiểm thử Email SMTP: " + cleanEmail);
    }

    // ── Helper methods ─────────────────────────────────────────────────────────

    private String resolveCustomerEmail(Order order) {
        String recipientEmail = order.getCustomerEmail();
        if ((recipientEmail == null || recipientEmail.isBlank()) && order.getUserId() != null) {
            User user = userRepository.findById(order.getUserId()).orElse(null);
            if (user != null && user.getEmail() != null) {
                recipientEmail = user.getEmail();
            }
        }
        return recipientEmail;
    }

    private String buildPaymentSuccessTemplate(String customerName,
                                              String orderCode,
                                              String orderTime,
                                              String paymentMethod,
                                              String shippingAddress,
                                              String customerPhone,
                                              List<OrderItem> items,
                                              String subtotalFormatted,
                                              String discountFormatted,
                                              String shippingFeeFormatted,
                                              String totalFormatted) {
        StringBuilder itemsHtml = new StringBuilder();
        if (items != null && !items.isEmpty()) {
            for (OrderItem item : items) {
                String itemName = item.getItemName() != null ? item.getItemName() : "Sản phẩm / Dịch vụ";
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                String priceStr = formatCurrency(item.getUnitPrice());
                String totalStr = formatCurrency(item.getTotalPrice());

                itemsHtml.append(String.format("""
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; color: #1E293B;">
                            <strong>%s</strong>
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: center; color: #475569;">
                            %d
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: right; color: #475569;">
                            %s
                        </td>
                        <td style="padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 13px; text-align: right; font-weight: bold; color: #0F172A;">
                            %s
                        </td>
                    </tr>
                    """, escapeHtml(itemName), qty, priceStr, totalStr));
            }
        } else {
            itemsHtml.append("""
                <tr>
                    <td colspan="4" style="padding: 12px; text-align: center; color: #94A3B8; font-size: 13px;">
                        Thông tin đơn hàng tiêu chuẩn
                    </td>
                </tr>
                """);
        }

        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>Xác nhận thanh toán đơn hàng</title></head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="margin-bottom: 8px;">
                                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle; filter: brightness(0) invert(1);" />
                                        </div>
                                        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">PICKLEBALL CLUB & PRO SHOP</h1>
                                        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Xác Nhận Thanh Toán Thành Công</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 32px 28px;">
                                        <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0;">Kính gửi <strong>%s</strong>,</p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
                                            Hệ thống đã nhận được khoản thanh toán cho đơn hàng của bạn. Đơn hàng đang được bộ phận vận hành xử lý.
                                        </p>

                                        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
                                            <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                                                <tr>
                                                    <td style="color: #166534; padding-bottom: 8px;"><strong>Mã đơn hàng:</strong></td>
                                                    <td align="right" style="color: #15803D; font-family: monospace; font-weight: bold; font-size: 14px; padding-bottom: 8px;">#%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #166534; padding-bottom: 8px;"><strong>Thời gian:</strong></td>
                                                    <td align="right" style="color: #334155; padding-bottom: 8px;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #166534; padding-bottom: 8px;"><strong>Phương thức TT:</strong></td>
                                                    <td align="right" style="color: #0F172A; font-weight: bold; padding-bottom: 8px;">%s</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #166534;"><strong>Trạng thái TT:</strong></td>
                                                    <td align="right" style="color: #16A34A; font-weight: 800;">✓ ĐÃ THANH TOÁN</td>
                                                </tr>
                                            </table>
                                        </div>

                                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #475569; line-height: 1.6;">
                                            <div><strong>Người nhận:</strong> %s %s</div>
                                            <div><strong>Địa chỉ:</strong> %s</div>
                                            <div><strong>Đơn vị giao hàng:</strong> Giao Hàng Nhanh (GHN Express)</div>
                                        </div>

                                        <h3 style="font-size: 14px; color: #0F172A; text-transform: uppercase; margin: 0 0 12px 0;">Chi Tiết Đơn Hàng</h3>
                                        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">
                                            <thead>
                                                <tr style="background-color: #F1F5F9;">
                                                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">Tên Mặt Hàng</th>
                                                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">SL</th>
                                                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">Đơn Giá</th>
                                                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">Thành Tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>%s</tbody>
                                        </table>

                                        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #475569;">
                                            <tr>
                                                <td style="padding: 4px 0;">Tạm tính:</td>
                                                <td align="right" style="padding: 4px 0; color: #0F172A;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0;">Giảm giá Voucher:</td>
                                                <td align="right" style="padding: 4px 0; color: #16A34A;">-%s</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0;">Phí vận chuyển GHN:</td>
                                                <td align="right" style="padding: 4px 0; color: #0F172A;">%s</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0 4px 0; font-size: 16px; font-weight: bold; color: #0F172A; border-top: 2px solid #E2E8F0;">Tổng thanh toán:</td>
                                                <td align="right" style="padding: 12px 0 4px 0; font-size: 18px; font-weight: 800; color: #059669; border-top: 2px solid #E2E8F0;">%s</td>
                                            </tr>
                                        </table>

                                        <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748B; line-height: 1.6; text-align: center;">
                                            Hotline hỗ trợ: <strong>1900 8888</strong> | Hỗ trợ 24/7
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """,
                escapeHtml(customerName),
                escapeHtml(orderCode),
                orderTime,
                paymentMethod,
                escapeHtml(customerName),
                (customerPhone != null && !customerPhone.isBlank()) ? "(" + escapeHtml(customerPhone) + ")" : "",
                (shippingAddress != null && !shippingAddress.isBlank()) ? escapeHtml(shippingAddress) : "Nhận tại CLB",
                itemsHtml.toString(),
                subtotalFormatted,
                discountFormatted,
                shippingFeeFormatted,
                totalFormatted
        );
    }

    private String formatPaymentMethod(String method) {
        if (method == null) return "Cổng Thanh Toán Trực Tuyến";
        String m = method.toLowerCase();
        if (m.contains("momo")) return "Ví Điện Tử MoMo (AIO Gateway)";
        if (m.contains("vietqr")) return "Quét Mã VietQR (Chuyển Khoản Nhanh)";
        if (m.contains("cod")) return "Thanh Toán Khi Nhận Hàng (COD)";
        return "Cổng Thanh Toán Trực Tuyến";
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0 ₫";
        NumberFormat nf = NumberFormat.getInstance(Locale.of("vi", "VN"));
        return nf.format(amount) + " ₫";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
