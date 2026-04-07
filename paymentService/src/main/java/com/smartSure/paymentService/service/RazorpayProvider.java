package com.smartSure.paymentService.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

public interface RazorpayProvider {
    RazorpayClient createClient() throws RazorpayException;
}

@Component
class RazorpayProviderImpl implements RazorpayProvider {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    public RazorpayClient createClient() throws RazorpayException {
        return new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }
}
