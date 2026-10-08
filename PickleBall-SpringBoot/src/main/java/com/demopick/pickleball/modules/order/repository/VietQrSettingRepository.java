package com.demopick.pickleball.modules.order.repository;

import com.demopick.pickleball.modules.order.entity.VietQrSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VietQrSettingRepository extends JpaRepository<VietQrSetting, Long> {
}
