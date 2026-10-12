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
}
