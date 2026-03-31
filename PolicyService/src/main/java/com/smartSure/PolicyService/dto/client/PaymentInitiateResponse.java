package com.smartSure.PolicyService.dto.client;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponse {
    private Long id;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private String status;
}
