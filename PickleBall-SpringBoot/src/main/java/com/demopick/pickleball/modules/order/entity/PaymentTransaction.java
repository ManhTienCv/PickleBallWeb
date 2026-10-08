package com.demopick.pickleball.modules.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, length = 50)
    private String orderCode;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod = "vietqr";

    @Column(name = "bank_id", length = 30)
    private String bankId;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_no", length = 50)
    private String accountNo;

    @Column(name = "account_name", length = 100)
    private String accountName;

    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "transfer_content", length = 100)
    private String transferContent;

    @Column(name = "transaction_id", length = 64)
    private String transactionId;

    @Column(length = 30)
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PaymentTransaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNo() { return accountNo; }
    public void setAccountNo(String accountNo) { this.accountNo = accountNo; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getTransferContent() { return transferContent; }
    public void setTransferContent(String transferContent) { this.transferContent = transferContent; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @JsonProperty("order_code")
    public String getOrderCodeSnake() { return orderCode; }

    @JsonProperty("order_id")
    public Long getOrderIdSnake() { return orderId; }

    @JsonProperty("payment_method")
    public String getPaymentMethodSnake() { return paymentMethod; }

    @JsonProperty("bank_id")
    public String getBankIdSnake() { return bankId; }

    @JsonProperty("bank_name")
    public String getBankNameSnake() { return bankName; }

    @JsonProperty("account_no")
    public String getAccountNoSnake() { return accountNo; }

    @JsonProperty("account_name")
    public String getAccountNameSnake() { return accountName; }

    @JsonProperty("transfer_content")
    public String getTransferContentSnake() { return transferContent; }

    @JsonProperty("transaction_id")
    public String getTransactionIdSnake() { return transactionId; }

    @JsonProperty("created_at")
    public String getCreatedAtSnake() { return createdAt != null ? createdAt.toString() : null; }
}
