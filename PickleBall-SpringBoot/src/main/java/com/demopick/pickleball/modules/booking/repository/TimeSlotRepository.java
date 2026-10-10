package com.demopick.pickleball.modules.booking.repository;

import com.demopick.pickleball.modules.booking.entity.TimeSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDateOrderByStartTimeAsc(LocalDate date);

    List<TimeSlot> findByCourtIdAndDateOrderByStartTimeAsc(Long courtId, LocalDate date);

    List<TimeSlot> findByDateAndStatusOrderByStartTimeAsc(LocalDate date, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ts FROM TimeSlot ts WHERE ts.id = :id")
    Optional<TimeSlot> findByIdWithLock(@Param("id") Long id);
}
