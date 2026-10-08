package com.demopick.pickleball.modules.order.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.order.entity.PaymentTransaction;
import com.demopick.pickleball.modules.order.entity.VietQrSetting;
import com.demopick.pickleball.modules.order.repository.PaymentTransactionRepository;
import com.demopick.pickleball.modules.order.service.VietQrSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class VietQrController {

    private final VietQrSettingService vietQrSettingService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    public VietQrController(VietQrSettingService vietQrSettingService,
                            PaymentTransactionRepository paymentTransactionRepository) {
        this.vietQrSettingService = vietQrSettingService;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    /**
     * Endpoint công khai cho khách hàng lấy thông tin STK/Ngân hàng khi Checkout & VietQR
     */
    @GetMapping({"/api/v1/settings/vietqr", "/api/settings/vietqr"})
    public ResponseEntity<ApiResponse<VietQrSetting>> getPublicVietQrSetting() {
        VietQrSetting setting = vietQrSettingService.getSetting();
        return ResponseEntity.ok(ApiResponse.success(setting, "Lấy thông tin cấu hình VietQR thành công"));
    }

    /**
     * Endpoint Admin lấy thông tin cấu hình VietQR
     */
    @GetMapping("/api/v1/admin/settings/vietqr")
    public ResponseEntity<ApiResponse<VietQrSetting>> getAdminVietQrSetting() {
        VietQrSetting setting = vietQrSettingService.getSetting();
        return ResponseEntity.ok(ApiResponse.success(setting, "Lấy thông tin cấu hình VietQR cho quản trị"));
    }

    /**
     * Endpoint Admin cập nhật thông tin tài khoản ngân hàng & bật/tắt VietQR
     */
    @PutMapping("/api/v1/admin/settings/vietqr")
    public ResponseEntity<ApiResponse<VietQrSetting>> updateAdminVietQrSetting(@RequestBody VietQrSetting updatedSetting) {
        VietQrSetting saved = vietQrSettingService.updateSetting(updatedSetting);
        return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật cấu hình cổng thanh toán VietQR thành công"));
    }

    /**
     * Endpoint Admin lấy danh sách lịch sử giao dịch đối soát tài chính
     */
    @GetMapping("/api/v1/admin/payments/transactions")
    public ResponseEntity<ApiResponse<List<PaymentTransaction>>> getPaymentTransactions() {
        List<PaymentTransaction> list = paymentTransactionRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách lịch sử giao dịch tài chính thành công"));
    }
}
