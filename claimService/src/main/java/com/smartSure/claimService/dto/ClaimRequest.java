package com.smartSure.claimService.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClaimRequest {
    private Long policyId;
    private java.math.BigDecimal amount;
    private String incidentDate; // passed as ISO string from frontend
    private String incidentLocation;
    private String description;
}
