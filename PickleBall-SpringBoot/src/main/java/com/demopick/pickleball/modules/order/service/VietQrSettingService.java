package com.demopick.pickleball.modules.order.service;

import com.demopick.pickleball.modules.order.entity.VietQrSetting;
import com.demopick.pickleball.modules.order.repository.VietQrSettingRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VietQrSettingService {

    private static final Logger log = LoggerFactory.getLogger(VietQrSettingService.class);

    private final VietQrSettingRepository vietQrSettingRepository;

    public VietQrSettingService(VietQrSettingRepository vietQrSettingRepository) {
        this.vietQrSettingRepository = vietQrSettingRepository;
    }

    @PostConstruct
    public void initDefaultSetting() {
        try {
            if (!vietQrSettingRepository.existsById(1L)) {
                VietQrSetting defaultSetting = new VietQrSetting(
                        1L,
                        "ICB",
                        "VietinBank (Ngân Hàng Công Thương)",
                        "102888888888",
                        "NGUYEN MANH TIEN",
                        true
                );
                vietQrSettingRepository.save(defaultSetting);
                log.info("Initialized default VietQR setting row (id=1) in database.");
            }
        } catch (Exception ex) {
            log.warn("Could not auto-initialize VietQR setting table: {}", ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public VietQrSetting getSetting() {
        return vietQrSettingRepository.findById(1L).orElseGet(() -> {
            VietQrSetting defaultSetting = new VietQrSetting(
                    1L,
                    "ICB",
                    "VietinBank (Ngân Hàng Công Thương)",
                    "102888888888",
                    "NGUYEN MANH TIEN",
                    true
            );
            return defaultSetting;
        });
    }

    @Transactional
    public VietQrSetting updateSetting(VietQrSetting update) {
        VietQrSetting current = vietQrSettingRepository.findById(1L).orElseGet(() -> new VietQrSetting(1L, "ICB", "VietinBank", "102888888888", "NGUYEN MANH TIEN", true));
        if (update.getBankId() != null && !update.getBankId().isBlank()) {
            current.setBankId(update.getBankId().trim());
        }
        if (update.getBankName() != null && !update.getBankName().isBlank()) {
            current.setBankName(update.getBankName().trim());
        }
        if (update.getAccountNo() != null && !update.getAccountNo().isBlank()) {
            current.setAccountNo(update.getAccountNo().trim());
        }
        if (update.getAccountName() != null && !update.getAccountName().isBlank()) {
            current.setAccountName(update.getAccountName().trim().toUpperCase());
        }
        if (update.getEnabled() != null) {
            current.setEnabled(update.getEnabled());
        }
        return vietQrSettingRepository.save(current);
    }
}
