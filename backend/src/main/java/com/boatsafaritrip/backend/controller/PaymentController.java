package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.Payment;
import com.boatsafaritrip.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public List<Payment> getPayments(){
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getPayment(@PathVariable Long id){
        return paymentService.getPaymentById(id);
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment){
        return paymentService.createPayment(payment);
    }

    @PostMapping("/{id}/process")
    Payment updatePayment(@PathVariable Long id, @RequestBody Map<String, String> body){
        String cardNumber = body.get("cardNumber");
        return paymentService.processPaymentSimulation(id, cardNumber);
    }

    @PutMapping("/{id}/verify")
    public Payment verifyPayment(@PathVariable Long id){
        return paymentService.verifyPayment(id);
    }

    @PutMapping("/{id}/refund")
    public Payment refundPayment(@PathVariable Long id){
        return paymentService.refundPayment(id);
    }

    @PutMapping("/{id}")
    public Payment updatePayment(@PathVariable Long id, @RequestBody Payment updatedPayment) {
        return paymentService.updateTransactionReference(id, updatedPayment.getTransactionReference());
    }
}
