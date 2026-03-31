package com.smartSure.PolicyService.client;

import com.smartSure.PolicyService.dto.client.PaymentInitiateRequest;
import com.smartSure.PolicyService.dto.client.PaymentInitiateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
        name = "paymentService",
        url = "${services.payment-service.url:http://payment-service:8085}"
)
public interface PaymentServiceClient {

    @PostMapping("/api/payments/initiate")
    PaymentInitiateResponse initiatePayment(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody PaymentInitiateRequest request);
}
