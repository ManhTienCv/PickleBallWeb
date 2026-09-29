package com.demopick.pickleball.modules.shop.repository;

import com.demopick.pickleball.modules.shop.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdAndDeletedAtIsNull(Long productId);
    Optional<ProductVariant> findBySku(String sku);
}
