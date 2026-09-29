package com.demopick.pickleball.modules.shop.repository;

import com.demopick.pickleball.modules.shop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsActiveTrueOrderBySortOrderAsc();
    Optional<Category> findBySlug(String slug);
}
