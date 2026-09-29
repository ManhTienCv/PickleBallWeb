package com.demopick.pickleball.modules.booking.repository;

import com.demopick.pickleball.modules.booking.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    List<Court> findByDeletedAtIsNullOrderByCodeAsc();
    Optional<Court> findByCode(String code);
}
