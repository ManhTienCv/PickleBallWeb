package com.demopick.pickleball.modules.shop.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("product_id")
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @JsonProperty("user_name")
    @Column(name = "user_name", length = 150)
    private String userName = "Khách hàng DemoPick";

    @JsonProperty("user_avatar")
    @Column(name = "user_avatar", length = 500)
    private String userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";

    @Column(nullable = false)
    private Integer rating = 5;

    @Column(length = 2000)
    private String comment;

    @JsonProperty("variant_purchased")
    @Column(name = "variant_purchased", length = 100)
    private String variantPurchased;

    @JsonProperty("is_verified_purchase")
    @Column(name = "is_verified_purchase")
    private Boolean isVerifiedPurchase = true;

    private Integer likes = 0;

    @Column(columnDefinition = "TEXT")
    private String images; // JSON or comma-separated URLs

    @Column(length = 30)
    private String status = "approved"; // approved, pending, rejected

    @JsonProperty("created_at")
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Review() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getVariantPurchased() { return variantPurchased; }
    public void setVariantPurchased(String variantPurchased) { this.variantPurchased = variantPurchased; }

    public Boolean getIsVerifiedPurchase() { return isVerifiedPurchase; }
    public void setIsVerifiedPurchase(Boolean verifiedPurchase) { isVerifiedPurchase = verifiedPurchase; }

    public Integer getLikes() { return likes; }
    public void setLikes(Integer likes) { this.likes = likes; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
