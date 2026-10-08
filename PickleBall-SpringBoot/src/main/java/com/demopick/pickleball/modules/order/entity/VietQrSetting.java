package com.demopick.pickleball.modules.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vietqr_settings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VietQrSetting {

    @Id
    private Long id = 1L;

    @Column(name = "bank_id", length = 30)
    private String bankId = "ICB";

    @Column(name = "bank_name", length = 100)
    private String bankName = "VietinBank (Ngân Hàng Công Thương)";

    @Column(name = "account_no", length = 50)
    private String accountNo = "102888888888";

    @Column(name = "account_name", length = 100)
    private String accountName = "NGUYEN MANH TIEN";

    @Column(nullable = false)
    private Boolean enabled = true;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public VietQrSetting() {}

    public VietQrSetting(Long id, String bankId, String bankName, String accountNo, String accountName, Boolean enabled) {
        this.id = id;
        this.bankId = bankId;
        this.bankName = bankName;
        this.accountNo = accountNo;
        this.accountName = accountName;
        this.enabled = enabled;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNo() { return accountNo; }
    public void setAccountNo(String accountNo) { this.accountNo = accountNo; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public Boolean getEnabled() { return enabled != null ? enabled : true; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @JsonProperty("bank_id")
    public String getBankIdSnake() { return bankId; }

    @JsonProperty("bank_name")
    public String getBankNameSnake() { return bankName; }

    @JsonProperty("account_no")
    public String getAccountNoSnake() { return accountNo; }

    @JsonProperty("account_name")
    public String getAccountNameSnake() { return accountName; }

    @JsonProperty("is_enabled")
    public Boolean getIsEnabledSnake() { return enabled; }

    @JsonProperty("updated_at")
    public String getUpdatedAtSnake() { return updatedAt != null ? updatedAt.toString() : null; }
}
