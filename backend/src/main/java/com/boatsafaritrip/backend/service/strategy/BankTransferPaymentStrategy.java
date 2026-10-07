package com.boatsafaritrip.backend.service.strategy;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class BankTransferPaymentStrategy implements PaymentProcessingStrategy {
    @Override
    public String getMethodName() { return "Bank Transfer"; }

    @Override
    public boolean isSuccessful(Map<String, String> paymentDetails) {
        return true; // accepted pending manual staff verification against bank records
    }
}