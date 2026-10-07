package com.boatsafaritrip.backend.service.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PaymentStrategyResolver {
    private final Map<String, PaymentProcessingStrategy> strategies = new HashMap<>();

    @Autowired
    public PaymentStrategyResolver(List<PaymentProcessingStrategy> strategyList) {
        for (PaymentProcessingStrategy s : strategyList) {
            strategies.put(s.getMethodName(), s);
        }
    }

    public PaymentProcessingStrategy resolve(String methodName) {
        PaymentProcessingStrategy strategy = strategies.get(methodName);
        if (strategy == null) throw new IllegalArgumentException("Unsupported payment method: " + methodName);
        return strategy;
    }
}