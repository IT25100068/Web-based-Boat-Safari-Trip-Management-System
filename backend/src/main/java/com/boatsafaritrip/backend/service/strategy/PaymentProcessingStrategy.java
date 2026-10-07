package com.boatsafaritrip.backend.service.strategy;

import java.util.Map;

public interface PaymentProcessingStrategy {
    String getMethodName();
    boolean isSuccessful(Map<String, String> paymentDetails);
}