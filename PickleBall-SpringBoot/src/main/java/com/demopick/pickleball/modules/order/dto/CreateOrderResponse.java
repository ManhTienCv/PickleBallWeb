package com.demopick.pickleball.modules.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public class CreateOrderResponse {

    @JsonProperty("orderCode")
    private String orderCode;

    @JsonProperty("order_code")
    private String orderCodeSnake;

    @JsonProperty("totalAmount")
    private BigDecimal totalAmount;

    @JsonProperty("total_amount")
    private BigDecimal totalAmountSnake;

    @JsonProperty("paymentMethod")
    private String paymentMethod;

    @JsonProperty("payment_method")
    private String paymentMethodSnake;

    @JsonProperty("paymentStatus")
    private String paymentStatus;

    @JsonProperty("payment_status")
    private String paymentStatusSnake;

    @JsonProperty("payUrl")
    private String payUrl;

    @JsonProperty("pay_url")
    private String payUrlSnake;

    @JsonProperty("qrCodeUrl")
    private String qrCodeUrl;

    @JsonProperty("qr_code_url")
    private String qrCodeUrlSnake;

    public CreateOrderResponse() {}

    public CreateOrderResponse(String orderCode, BigDecimal totalAmount, String paymentMethod, String paymentStatus, String payUrl, String qrCodeUrl) {
        this.orderCode = orderCode;
        this.orderCodeSnake = orderCode;
        this.totalAmount = totalAmount;
        this.totalAmountSnake = totalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentMethodSnake = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.paymentStatusSnake = paymentStatus;
        this.payUrl = payUrl;
        this.payUrlSnake = payUrl;
        this.qrCodeUrl = qrCodeUrl;
        this.qrCodeUrlSnake = qrCodeUrl;
    }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { 
        this.orderCode = orderCode;
        this.orderCodeSnake = orderCode;
    }

    public String getOrderCodeSnake() { return orderCodeSnake; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { 
        this.totalAmount = totalAmount;
        this.totalAmountSnake = totalAmount;
    }

    public BigDecimal getTotalAmountSnake() { return totalAmountSnake; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { 
        this.paymentMethod = paymentMethod;
        this.paymentMethodSnake = paymentMethod;
    }

    public String getPaymentMethodSnake() { return paymentMethodSnake; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { 
        this.paymentStatus = paymentStatus;
        this.paymentStatusSnake = paymentStatus;
    }

    public String getPaymentStatusSnake() { return paymentStatusSnake; }

    public String getPayUrl() { return payUrl; }
    public void setPayUrl(String payUrl) { 
        this.payUrl = payUrl;
        this.payUrlSnake = payUrl;
    }

    public String getPayUrlSnake() { return payUrlSnake; }

    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { 
        this.qrCodeUrl = qrCodeUrl;
        this.qrCodeUrlSnake = qrCodeUrl;
    }

    public String getQrCodeUrlSnake() { return qrCodeUrlSnake; }
}
