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

    @PostConstruct
    public void seedInitialVouchers() {
        if (voucherRepository.count() == 0) {
            Voucher v1 = new Voucher();
            v1.setCode("WELCOME2026");
            v1.setTitle("Ưu Đãi Hội Viên Mới");
            v1.setDescription("Giảm ngay 50.000đ cho đơn hàng đầu tiên từ 300.000đ");
            v1.setDiscountType("fixed");
            v1.setDiscountValue(50000.0);
            v1.setMaxDiscount(null);
            v1.setMinOrderAmount(300000.0);
            v1.setUsageLimit(1000);
            v1.setUsedCount(142);
            v1.setStartDate("2026-01-01");
            v1.setEndDate("2026-12-31");
            v1.setIsActive(true);
            voucherRepository.save(v1);

            Voucher v2 = new Voucher();
            v2.setCode("PICKLEBALL10");
            v2.setTitle("Giảm 10% Vợt Thi Đấu");
            v2.setDescription("Áp dụng cho mọi dòng vợt USAPA cao cấp Joola & Selkirk");
            v2.setDiscountType("percentage");
            v2.setDiscountValue(10.0);
            v2.setMaxDiscount(200000.0);
            v2.setMinOrderAmount(500000.0);
            v2.setUsageLimit(500);
            v2.setUsedCount(89);
            v2.setStartDate("2026-06-01");
            v2.setEndDate("2026-12-31");
            v2.setIsActive(true);
            voucherRepository.save(v2);

            Voucher v3 = new Voucher();
            v3.setCode("FREESHIP");
            v3.setTitle("Miễn Phí Giao Hàng Toàn Quốc");
            v3.setDescription("Hỗ trợ tối đa 35.000đ cước chuyển phát nhanh GHN");
            v3.setDiscountType("fixed");
            v3.setDiscountValue(35000.0);
            v3.setMaxDiscount(35000.0);
            v3.setMinOrderAmount(400000.0);
            v3.setUsageLimit(2000);
            v3.setUsedCount(531);
            v3.setStartDate("2026-03-01");
            v3.setEndDate("2026-12-31");
            v3.setIsActive(true);
            voucherRepository.save(v3);
        }
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
