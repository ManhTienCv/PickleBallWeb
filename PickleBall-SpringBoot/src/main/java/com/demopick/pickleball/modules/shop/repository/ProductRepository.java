package com.demopick.pickleball.modules.shop.repository;

import com.demopick.pickleball.modules.shop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatusAndDeletedAtIsNullOrderByIdDesc(String status);
    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);
    List<Product> findByCategoryIdAndDeletedAtIsNull(Long categoryId);
}
