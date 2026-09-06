package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Payment;
import com.boatsafaritrip.backend.repository.PaymentRepository;
import jakarta.persistence.Id;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service

public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    public List<Payment> getAllPayments(){
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id){
        return paymentRepository.findById(id).
                orElseThrow(() -> new PaymentNotFoundException("Payment not found with id " + id));
    }

    public Payment createPayment(Payment payment){
        if (payment.getAmount() == null || payment.getAmount().compareTo(BigDecimal.ZERO) <= 0){
            throw new IllegalArgumentException("Payment amound must be greater than zero");
        }
        if (payment.getPaymentMethod() == null || payment.getPaymentMethod().isEmpty()){
            throw new IllegalArgumentException("Payment method is required");
        }

        payment.setStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    public Payment verifyPayment(Long id){
        Payment payment = getPaymentById(id);
        payment.setStatus("VERIFIED");
        return paymentRepository.save(payment);
    }

    public Payment refundPayment(Long id){
        Payment payment = getPaymentById(id);
        payment.setStatus("REFUNDED");
        return paymentRepository.save(payment);
    }

    public Payment processPaymentSimulation(Long id, String cardNumber){
        Payment payment = getPaymentById(id);

        //Simulate gateway processing delay
        try {
            Thread.sleep(1500);
        }catch (InterruptedException e){
            Thread.currentThread().interrupt();
        }

        // Simple test rule: card ending in "0000" simulates a failed payment
        boolean success = cardNumber == null || !cardNumber.endsWith("0000");

        if(success){
            payment.setStatus("VERIFIED");
            payment.setTransactionReference("TXN-" + System.currentTimeMillis());
        } else {
            payment.setStatus("FAILED");
        }

        return paymentRepository.save(payment);
    }

    public Payment updateTransactionReference(Long id, String reference) {
        Payment payment = getPaymentById(id);
        payment.setTransactionReference(reference);
        return paymentRepository.save(payment);
    }
}
