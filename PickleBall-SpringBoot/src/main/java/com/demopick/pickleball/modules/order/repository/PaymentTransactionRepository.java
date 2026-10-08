package com.demopick.pickleball.modules.order.repository;

import com.demopick.pickleball.modules.order.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByOrderCode(String orderCode);
    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();
    Optional<PaymentTransaction> findFirstByOrderCodeOrderByCreatedAtDesc(String orderCode);
}
