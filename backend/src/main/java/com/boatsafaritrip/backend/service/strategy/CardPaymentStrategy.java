package com.boatsafaritrip.backend.service.strategy;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class CardPaymentStrategy implements PaymentProcessingStrategy {
    @Override
    public String getMethodName() { return "Card"; }

    @Override
    public boolean isSuccessful(Map<String, String> paymentDetails) {
        String cardNumber = paymentDetails.get("cardNumber");
        return cardNumber != null && !cardNumber.endsWith("0000");
    }
}