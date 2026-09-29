package com.demopick.pickleball.modules.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class CheckoutResponse {

    @JsonProperty("order_code")
    private String orderCode;

    @JsonProperty("total_amount")
    private BigDecimal totalAmount;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("pay_url")
    private String payUrl;

    @JsonProperty("qr_code_url")
    private String qrCodeUrl;

    public CheckoutResponse() {}

    public CheckoutResponse(String orderCode, BigDecimal totalAmount, String paymentMethod, String payUrl, String qrCodeUrl) {
        this.orderCode = orderCode;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.payUrl = payUrl;
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPayUrl() { return payUrl; }
    public void setPayUrl(String payUrl) { this.payUrl = payUrl; }

    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
}
