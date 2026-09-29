package com.demopick.pickleball.modules.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class CheckoutRequest {

    @JsonProperty("hold_id")
    private Long holdId;

    @JsonProperty("slot_id")
    private Long slotId;

    @JsonProperty("payment_method")
    private String paymentMethod; // momo, vietqr, cash

    @JsonProperty("pickup_notes")
    private String pickupNotes;

    @JsonProperty("cart_items")
    private List<CartItemDto> cartItems;

    public CheckoutRequest() {}

    public Long getHoldId() { return holdId; }
    public void setHoldId(Long holdId) { this.holdId = holdId; }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPickupNotes() { return pickupNotes; }
    public void setPickupNotes(String pickupNotes) { this.pickupNotes = pickupNotes; }

    public List<CartItemDto> getCartItems() { return cartItems; }
    public void setCartItems(List<CartItemDto> cartItems) { this.cartItems = cartItems; }

    public static class CartItemDto {
        @JsonProperty("variant_id")
        private Long variantId;

        private Integer quantity;

        public CartItemDto() {}
        public CartItemDto(Long variantId, Integer quantity) {
            this.variantId = variantId;
            this.quantity = quantity;
        }

        public Long getVariantId() { return variantId; }
        public void setVariantId(Long variantId) { this.variantId = variantId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
