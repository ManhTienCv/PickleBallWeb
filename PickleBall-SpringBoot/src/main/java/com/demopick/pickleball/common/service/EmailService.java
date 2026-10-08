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
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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

    @Value("${spring.mail.username:demopick.sports@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${mail.from.address:demopick.sports@gmail.com}")
    private String fromAddress;

    @Value("${mail.from.name:Pickleball}")
    private String fromName;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender,
                        UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    /**
     * Gửi email xác nhận thanh toán thành công cho khách hàng
     */
    @Async
    public boolean sendPaymentSuccessEmail(Order order, List<OrderItem> items) {
        if (order == null) return false;

        String recipientEmail = order.getCustomerEmail();
        if ((recipientEmail == null || recipientEmail.isBlank()) && order.getUserId() != null) {
            User user = userRepository.findById(order.getUserId()).orElse(null);
            if (user != null && user.getEmail() != null) {
                recipientEmail = user.getEmail();
            }
        }

        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.info("Không có email khách hàng để gửi thông báo cho đơn #{}", order.getOrderCode());
            return false;
        }

        String customerName = order.getCustomerName() != null ? order.getCustomerName() : "Quý khách";
        String orderCode = order.getOrderCode();
        String paymentMethod = formatPaymentMethod(order.getPaymentMethod());
        String totalFormatted = formatCurrency(order.getTotalAmount());
        String subtotalFormatted = formatCurrency(order.getSubtotal());
        String discountFormatted = formatCurrency(order.getDiscount());
        String shippingFeeFormatted = formatCurrency(order.getShippingFee());
        String orderTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));

        String subject = "🏸 [Pickleball] Xác nhận thanh toán thành công cho đơn hàng #" + orderCode;
        String htmlContent = buildEmailTemplate(
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

        // Kiểm tra xem đã có cấu hình SMTP password chưa
        boolean hasSmtpConfig = mailSender != null && mailPassword != null && !mailPassword.trim().isEmpty();

        if (hasSmtpConfig) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromAddress, fromName);
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("ĐÃ GỬI EMAIL THẬT THÀNH CÔNG tới {} cho đơn #{}", recipientEmail, orderCode);
                return true;
            } catch (Exception ex) {
                log.warn("Không thể gửi email qua SMTP ({}) tới {}: {}. Chuyển sang ghi nhận mô phỏng.", 
                        fromAddress, recipientEmail, ex.getMessage());
            }
        }

        // Chế độ mô phỏng / Development log (khi chưa nhập mật khẩu ứng dụng Gmail)
        log.info("""
                ================================================================================
                [EMAIL NOTIFICATION SIMULATION]
                Gửi tới: {}
                Tiêu đề: {}
                Mã đơn: #{} | Tổng tiền: {} | PTTT: {}
                Ghi chú: Để gửi email thật tới hòm thư người dùng, vui lòng cấu hình MAIL_PASSWORD trong file .env hoặc biến môi trường.
                ================================================================================
                """, recipientEmail, subject, orderCode, totalFormatted, paymentMethod);

        return true;
    }

    private String buildEmailTemplate(String customerName,
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
            <head>
                <meta charset="UTF-8">
                <title>Xác nhận thanh toán đơn hàng</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 30px 10px;">
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
                                <!-- Header -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #059669 0%%, #10B981 100%%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
                                        <div style="font-size: 28px; margin-bottom: 8px;">🏸</div>
                                        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">PICKLEBALL CLUB & PRO SHOP</h1>
                                        <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Xác Nhận Thanh Toán Thành Công</p>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 32px 28px;">
                                        <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
                                            Kính gửi <strong>%s</strong>,
                                        </p>
                                        <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
                                            Hệ thống đã nhận được khoản thanh toán cho đơn hàng của bạn. Đơn hàng đang được bộ phận vận hành xử lý và chuẩn bị bàn giao cho bưu tá GHN Express.
                                        </p>

                                        <!-- Order Info Box -->
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

                                        <!-- Delivery Info -->
                                        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #475569; line-height: 1.6;">
                                            <div><strong>Người nhận:</strong> %s %s</div>
                                            <div><strong>Địa chỉ:</strong> %s</div>
                                            <div><strong>Đơn vị giao hàng:</strong> Giao Hàng Nhanh (GHN Express)</div>
                                        </div>

                                        <!-- Items Table -->
                                        <h3 style="font-size: 14px; color: #0F172A; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.5px;">Chi Tiết Đơn Hàng</h3>
                                        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">
                                            <thead>
                                                <tr style="background-color: #F1F5F9;">
                                                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">Tên Mặt Hàng</th>
                                                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">SL</th>
                                                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">Đơn Giá</th>
                                                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #475569; border-bottom: 2px solid #CBD5E1;">Thành Tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                %s
                                            </tbody>
                                        </table>

                                        <!-- Summary Box -->
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
                                            Nếu quý khách cần hỗ trợ thay đổi địa chỉ hoặc tra cứu đơn hàng, vui lòng liên hệ hotline <strong>1900 8888</strong> hoặc phản hồi email này.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 11px; color: #94A3B8;">
                                        <p style="margin: 0 0 4px 0;">© 2026 DemoPick Pickleball Club. Mọi quyền được bảo lưu.</p>
                                        <p style="margin: 0;">123 Đường Pickleball, Tân Phong, Quận 7, TP. Hồ Chí Minh</p>
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
                (shippingAddress != null && !shippingAddress.isBlank()) ? escapeHtml(shippingAddress) : "Nhận tại câu lạc bộ sân",
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
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
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
