package com.demopick.pickleball.modules.booking.dto;

import java.util.List;

public class CourtAvailabilityResponse {
    private Long courtId;
    private String courtName;
    private String courtCode;
    private String surfaceType;
    private List<SlotDto> slots;

    public CourtAvailabilityResponse() {}

    public CourtAvailabilityResponse(Long courtId, String courtName, String courtCode, String surfaceType, List<SlotDto> slots) {
        this.courtId = courtId;
        this.courtName = courtName;
        this.courtCode = courtCode;
        this.surfaceType = surfaceType;
        this.slots = slots;
    }

    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }

    public String getCourtName() { return courtName; }
    public void setCourtName(String courtName) { this.courtName = courtName; }

    public String getCourtCode() { return courtCode; }
    public void setCourtCode(String courtCode) { this.courtCode = courtCode; }

    public String getSurfaceType() { return surfaceType; }
    public void setSurfaceType(String surfaceType) { this.surfaceType = surfaceType; }

    public List<SlotDto> getSlots() { return slots; }
    public void setSlots(List<SlotDto> slots) { this.slots = slots; }
}
