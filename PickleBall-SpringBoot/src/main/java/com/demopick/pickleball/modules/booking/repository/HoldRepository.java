package com.demopick.pickleball.modules.booking.repository;

import com.demopick.pickleball.modules.booking.entity.Hold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoldRepository extends JpaRepository<Hold, Long> {

    Optional<Hold> findBySlotIdAndStatusAndExpiresAtAfter(Long slotId, String status, LocalDateTime now);

    List<Hold> findByStatusAndExpiresAtBefore(String status, LocalDateTime now);

    Optional<Hold> findBySlotIdAndUserIdAndStatus(Long slotId, Long userId, String status);
}
