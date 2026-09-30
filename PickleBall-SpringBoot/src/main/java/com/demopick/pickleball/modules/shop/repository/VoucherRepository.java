package com.demopick.pickleball.modules.shop.repository;

import com.demopick.pickleball.modules.shop.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    boolean existsByCode(String code);

    List<Voucher> findAllByOrderByCreatedAtDesc();

    @Query("SELECT v FROM Voucher v WHERE LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY v.createdAt DESC")
    List<Voucher> searchVouchers(@Param("keyword") String keyword);
}
