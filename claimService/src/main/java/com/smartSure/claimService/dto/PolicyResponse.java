package com.smartSure.claimService.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyResponse {

    private Long id;
    private String policyNumber;
    private Long customerId;
    private PolicyTypeResponse policyType;
    private BigDecimal coverageAmount;
    private BigDecimal premiumAmount;
    private String paymentFrequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String nomineeName;
    private String nomineeRelation;
    private String remarks;
    private String cancellationReason;
    private String createdAt;
    private List<PremiumResponse> premiums;
}