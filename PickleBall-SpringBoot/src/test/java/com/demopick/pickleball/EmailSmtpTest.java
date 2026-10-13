package com.demopick.pickleball;

import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class EmailSmtpTest {

    @Test
    public void testSendEmailDirect() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername("nvmtein@gmail.com");
        mailSender.setPassword("rsaegcuzmnruldjs");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("nvmtein@gmail.com", "Pickleball Club");
            helper.setTo("nvmtein@gmail.com");
            helper.setSubject("🌟 [Pickleball Club] Kiểm thử dịch vụ Email SMTP thành công!");
            
            String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #10b981;">
                        <div style="margin-bottom: 8px;">
                            <img src="https://pickleball-manhtien.vercel.app/pickleball-logo.svg" alt="Pickleball" width="48" height="48" style="width: 48px; height: 48px; display: inline-block; vertical-align: middle;" />
                        </div>
                        <h1 style="color: #059669; margin: 0; font-size: 24px; font-weight: 800;">PICKLEBALL CLUB</h1>
                        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Kiểm tra dịch vụ gửi Email Thông Báo Tự Động</p>
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
                                <td style="padding: 10px 0; font-weight: bold; color: #1e293b; text-align: right;">nvmtein@gmail.com</td>
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
                    
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
                        © 2026 Pickleball Club. Mọi quyền được bảo lưu.
                    </div>
                </div>
            """;

            helper.setText(htmlContent, true);

            System.out.println("Đang gửi email tới nvmtein@gmail.com...");
            mailSender.send(message);
            System.out.println(">>> GỬI EMAIL THÀNH CÔNG RỰC RỠ TỚI nvmtein@gmail.com <<<");
        } catch (Exception e) {
            System.err.println(">>> GỬI EMAIL THẤT BẠI: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Test
    public void testSendOtpEmailDirect() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername("nvmtein@gmail.com");
        mailSender.setPassword("rsaegcuzmnruldjs");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("nvmtein@gmail.com", "Pickleball");
            helper.setTo("nvmtein@gmail.com");
            helper.setSubject("🔑 [Pickleball] Mã OTP đặt lại mật khẩu của bạn");

            String otp = "864209";
            String htmlContent = """
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
            """;

            helper.setText(String.format(htmlContent, otp), true);

            System.out.println("Đang gửi email OTP đặt lại mật khẩu tới nvmtein@gmail.com...");
            mailSender.send(message);
            System.out.println(">>> GỬI EMAIL OTP THÀNH CÔNG RỰC RỠ TỚI nvmtein@gmail.com <<<");
        } catch (Exception e) {
            System.err.println(">>> GỬI EMAIL OTP THẤT BẠI: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Test
    public void testSendEmailBrevoApi() throws Exception {
        String apiKey = System.getenv("BREVO_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println(">>> Bỏ qua test Brevo API do chưa cấu hình biến môi trường BREVO_API_KEY.");
            return;
        }
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("sender", java.util.Map.of("name", "Pickleball", "email", "nvmtein@gmail.com"));
        payload.put("to", java.util.List.of(java.util.Map.of("email", "nvmtein@gmail.com")));
        payload.put("subject", "🏸 [Pickleball] Kiểm thử Brevo REST API (HTTPS/443) thành công!");
        payload.put("htmlContent", "<h3>Chào bạn, Brevo REST API kết nối thành công 100% qua cổng 443!</h3>");

        String json = mapper.writeValueAsString(payload);
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("accept", "application/json")
                .header("api-key", apiKey)
                .header("content-type", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json, java.nio.charset.StandardCharsets.UTF_8))
                .build();

        java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
        System.out.println(">>> Brevo API Status Code: " + response.statusCode());
        System.out.println(">>> Brevo API Response Body: " + response.body());
        org.junit.jupiter.api.Assertions.assertTrue(response.statusCode() >= 200 && response.statusCode() < 300);
    }

    @Test
    public void testEmailServiceWithBrevo() {
        String apiKey = System.getenv("BREVO_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println(">>> Bỏ qua test EmailService Brevo do chưa cấu hình biến môi trường BREVO_API_KEY.");
            return;
        }
        com.demopick.pickleball.common.service.EmailService service = new com.demopick.pickleball.common.service.EmailService(null, null);
        org.springframework.test.util.ReflectionTestUtils.setField(service, "brevoApiKey", apiKey);
        org.springframework.test.util.ReflectionTestUtils.setField(service, "brevoSenderEmail", "nvmtein@gmail.com");
        org.springframework.test.util.ReflectionTestUtils.setField(service, "brevoSenderName", "Pickleball");

        boolean sentRegister = service.sendRegisterOtpEmail("nvmtein@gmail.com", "998877", "Nguyễn Văn Mạnh Tiến");
        System.out.println(">>> Kết quả gửi OTP đăng ký qua EmailService (Brevo REST API): " + sentRegister);
        org.junit.jupiter.api.Assertions.assertTrue(sentRegister);

        boolean sentReset = service.sendOtpResetPasswordEmail("nvmtein@gmail.com", "654321");
        System.out.println(">>> Kết quả gửi OTP reset password qua EmailService (Brevo REST API): " + sentReset);
        org.junit.jupiter.api.Assertions.assertTrue(sentReset);
    }
}
