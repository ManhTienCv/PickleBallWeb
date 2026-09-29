package com.demopick.pickleball.modules.booking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

public class HoldResponse {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("hold_id")
    private Long holdId;

    @JsonProperty("slot_id")
    private Long slotId;

    @JsonProperty("slot_ids")
    private List<Long> slotIds;

    @JsonProperty("court_id")
    private Long courtId;

    @JsonProperty("expires_at")
    private String expiresAt;

    @JsonProperty("remaining_seconds")
    private Integer remainingSeconds;

    @JsonProperty("seconds_remaining")
    private Integer secondsRemaining;

    @JsonProperty("total_price")
    private BigDecimal totalPrice;

    public HoldResponse() {}

    public HoldResponse(Long holdId, Long slotId, Long courtId, String expiresAt, Integer remainingSeconds, BigDecimal totalPrice) {
        this.id = holdId;
        this.holdId = holdId;
        this.slotId = slotId;
        this.slotIds = slotId != null ? List.of(slotId) : Collections.emptyList();
        this.courtId = courtId;
        this.expiresAt = expiresAt;
        this.remainingSeconds = remainingSeconds;
        this.secondsRemaining = remainingSeconds;
        this.totalPrice = totalPrice != null ? totalPrice : BigDecimal.ZERO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHoldId() { return holdId; }
    public void setHoldId(Long holdId) { this.holdId = holdId; }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public List<Long> getSlotIds() { return slotIds; }
    public void setSlotIds(List<Long> slotIds) { this.slotIds = slotIds; }

    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }

    public Integer getRemainingSeconds() { return remainingSeconds; }
    public void setRemainingSeconds(Integer remainingSeconds) { this.remainingSeconds = remainingSeconds; }

    public Integer getSecondsRemaining() { return secondsRemaining; }
    public void setSecondsRemaining(Integer secondsRemaining) { this.secondsRemaining = secondsRemaining; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
