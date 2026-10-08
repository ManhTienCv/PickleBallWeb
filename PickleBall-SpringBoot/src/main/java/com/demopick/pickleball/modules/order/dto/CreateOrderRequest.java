package com.demopick.pickleball.modules.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

public class CreateOrderRequest {

    @JsonProperty("shippingName")
    private String shippingName;

    @JsonProperty("shippingPhone")
    private String shippingPhone;

    @JsonProperty("shippingAddress")
    private String shippingAddress;

    @JsonProperty("customerEmail")
    private String customerEmail;

    @JsonProperty("ghnProvinceId")
    private Integer ghnProvinceId;

    @JsonProperty("ghnDistrictId")
    private Integer ghnDistrictId;

    @JsonProperty("ghnWardCode")
    private String ghnWardCode;

    @JsonProperty("paymentMethod")
    private String paymentMethod; // "momo" | "cod"

    @JsonProperty("voucherCode")
    private String voucherCode;

    @JsonProperty("discount")
    private BigDecimal discount;

    @JsonProperty("holdId")
    private Long holdId;

    @JsonProperty("slotId")
    private Long slotId;

    @JsonProperty("shippingFee")
    private BigDecimal shippingFee;

    @JsonProperty("items")
    private List<CreateOrderItemDto> items;

    public CreateOrderRequest() {}

    public String getShippingName() { return shippingName; }
    public void setShippingName(String shippingName) { this.shippingName = shippingName; }

    public String getShippingPhone() { return shippingPhone; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Integer getGhnProvinceId() { return ghnProvinceId; }
    public void setGhnProvinceId(Integer ghnProvinceId) { this.ghnProvinceId = ghnProvinceId; }

    public Integer getGhnDistrictId() { return ghnDistrictId; }
    public void setGhnDistrictId(Integer ghnDistrictId) { this.ghnDistrictId = ghnDistrictId; }

    public String getGhnWardCode() { return ghnWardCode; }
    public void setGhnWardCode(String ghnWardCode) { this.ghnWardCode = ghnWardCode; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public Long getHoldId() { return holdId; }
    public void setHoldId(Long holdId) { this.holdId = holdId; }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public List<CreateOrderItemDto> getItems() { return items; }
    public void setItems(List<CreateOrderItemDto> items) { this.items = items; }

    public static class CreateOrderItemDto {
        private Long id;

        @JsonProperty("product_id")
        private Long productId;

        private String name;
        private Integer quantity;
        private BigDecimal price;

        public CreateOrderItemDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}
