package com.demopick.pickleball.modules.shop.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 500)
    private String description;

    @JsonProperty("discount_type")
    @Column(name = "discount_type", length = 30)
    private String discountType = "fixed"; // "fixed" hoặc "percentage"

    @JsonProperty("discount_value")
    @Column(name = "discount_value")
    private Double discountValue = 0.0;

    @JsonProperty("max_discount")
    @Column(name = "max_discount")
    private Double maxDiscount;

    @JsonProperty("min_order_amount")
    @Column(name = "min_order_amount")
    private Double minOrderAmount = 0.0;

    @JsonProperty("usage_limit")
    @Column(name = "usage_limit")
    private Integer usageLimit = 1000;

    @JsonProperty("used_count")
    @Column(name = "used_count")
    private Integer usedCount = 0;

    @JsonProperty("start_date")
    @Column(name = "start_date", length = 30)
    private String startDate;

    @JsonProperty("end_date")
    @Column(name = "end_date", length = 30)
    private String endDate;

    @JsonProperty("is_active")
    @Column(name = "is_active")
    private Boolean isActive = true;

    @JsonProperty("created_at")
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Voucher() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(Double maxDiscount) { this.maxDiscount = maxDiscount; }

    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }

    public Integer getUsedCount() { return usedCount; }
    public void setUsedCount(Integer usedCount) { this.usedCount = usedCount; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
