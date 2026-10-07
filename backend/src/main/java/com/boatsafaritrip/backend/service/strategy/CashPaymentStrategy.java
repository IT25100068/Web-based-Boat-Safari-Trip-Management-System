package com.boatsafaritrip.backend.service.strategy;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class CashPaymentStrategy implements PaymentProcessingStrategy {
    @Override
    public String getMethodName() { return "Cash"; }

    @Override
    public boolean isSuccessful(Map<String, String> paymentDetails) {
        return true; // accepted pending manual staff verification
    }
}