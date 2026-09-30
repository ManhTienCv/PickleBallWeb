package com.demopick.pickleball.modules.shop.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import com.demopick.pickleball.modules.shop.entity.Voucher;
import com.demopick.pickleball.modules.shop.repository.VoucherRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/vouchers")
public class AdminVoucherController {

    private final VoucherRepository voucherRepository;

    public AdminVoucherController(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Voucher>>> getVouchers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        List<Voucher> list;
        if (search != null && !search.isBlank()) {
            list = voucherRepository.searchVouchers(search.trim());
        } else {
            list = voucherRepository.findAllByOrderByCreatedAtDesc();
        }

        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            boolean active = "active".equalsIgnoreCase(status);
            list = list.stream().filter(v -> Objects.equals(v.getIsActive(), active)).toList();
        }

        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách mã ưu đãi thành công."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Voucher>> createVoucher(@RequestBody Voucher voucher) {
        if (voucher.getCode() == null || voucher.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã voucher không được để trống.", null));
        }

        String cleanCode = voucher.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCode(cleanCode)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mã voucher '" + cleanCode + "' đã tồn tại trên hệ thống.", null));
        }

        voucher.setCode(cleanCode);
        if (voucher.getUsedCount() == null) {
            voucher.setUsedCount(0);
        }
        if (voucher.getIsActive() == null) {
            voucher.setIsActive(true);
        }

        Voucher saved = voucherRepository.save(voucher);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo mã ưu đãi thành công."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Voucher>> updateVoucher(
            @PathVariable Long id,
            @RequestBody Voucher updated
    ) {
        Optional<Voucher> opt = voucherRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Voucher v = opt.get();
        if (updated.getTitle() != null) v.setTitle(updated.getTitle());
        if (updated.getDescription() != null) v.setDescription(updated.getDescription());
        if (updated.getDiscountType() != null) v.setDiscountType(updated.getDiscountType());
        if (updated.getDiscountValue() != null) v.setDiscountValue(updated.getDiscountValue());
        if (updated.getMaxDiscount() != null) v.setMaxDiscount(updated.getMaxDiscount());
        if (updated.getMinOrderAmount() != null) v.setMinOrderAmount(updated.getMinOrderAmount());
        if (updated.getUsageLimit() != null) v.setUsageLimit(updated.getUsageLimit());
        if (updated.getStartDate() != null) v.setStartDate(updated.getStartDate());
        if (updated.getEndDate() != null) v.setEndDate(updated.getEndDate());
        if (updated.getIsActive() != null) v.setIsActive(updated.getIsActive());

        Voucher saved = voucherRepository.save(v);
        return ResponseEntity.ok(ApiResponse.success(saved, "Cập nhật mã ưu đãi thành công."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        if (voucherRepository.existsById(id)) {
            voucherRepository.deleteById(id);
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa mã ưu đãi thành công."));
    }
}
