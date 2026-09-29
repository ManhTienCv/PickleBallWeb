package com.demopick.pickleball.modules.booking.dto;

import java.math.BigDecimal;

public class SlotDto {
    private Long id;
    private Long courtId;
    private String date;
    private String startTime;
    private String endTime;
    private BigDecimal price;
    private String status;
    private Boolean isCutoff;

    public SlotDto() {}

    public SlotDto(Long id, Long courtId, String date, String startTime, String endTime, BigDecimal price, String status, Boolean isCutoff) {
        this.id = id;
        this.courtId = courtId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.price = price;
        this.status = status;
        this.isCutoff = isCutoff;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsCutoff() { return isCutoff; }
    public void setIsCutoff(Boolean isCutoff) { this.isCutoff = isCutoff; }
}
