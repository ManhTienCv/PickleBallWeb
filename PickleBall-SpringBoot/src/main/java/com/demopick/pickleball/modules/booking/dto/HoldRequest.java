package com.demopick.pickleball.modules.booking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class HoldRequest {

    @JsonProperty("slot_id")
    private Long slotId;

    @JsonProperty("slot_ids")
    private List<Long> slotIds;

    @JsonProperty("date")
    private String date;

    public HoldRequest() {}

    public Long getSlotId() {
        if (slotId != null) return slotId;
        if (slotIds != null && !slotIds.isEmpty()) return slotIds.get(0);
        return null;
    }

    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public List<Long> getSlotIds() { return slotIds; }
    public void setSlotIds(List<Long> slotIds) { this.slotIds = slotIds; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
