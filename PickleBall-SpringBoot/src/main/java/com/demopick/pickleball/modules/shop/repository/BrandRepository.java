package com.demopick.pickleball.modules.shop.repository;

import com.demopick.pickleball.modules.shop.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByIsActiveTrueOrderByNameAsc();
    Optional<Brand> findBySlug(String slug);
}
