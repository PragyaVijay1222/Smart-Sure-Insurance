package com.smartSure.PolicyService.dto.client;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentInitiateRequest {
    private Long policyId;
    private Long premiumId;
    private BigDecimal amount;
    private String paymentMethod;
}
