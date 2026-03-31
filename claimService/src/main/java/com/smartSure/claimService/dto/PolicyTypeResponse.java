package com.smartSure.claimService.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyTypeResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal basePremium;
    private BigDecimal maxCoverageAmount;
    private BigDecimal deductibleAmount;
    private Integer termMonths;
    private Integer minAge;
    private Integer maxAge;
    private String status;
    private String coverageDetails;
    private String createdAt;
}