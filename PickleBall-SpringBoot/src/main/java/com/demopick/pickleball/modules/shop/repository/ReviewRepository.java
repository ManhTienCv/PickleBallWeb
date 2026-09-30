package com.demopick.pickleball.modules.shop.repository;

import com.demopick.pickleball.modules.shop.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, String status);
    List<Review> findAllByOrderByCreatedAtDesc();
    List<Review> findByStatusOrderByCreatedAtDesc(String status);
}
