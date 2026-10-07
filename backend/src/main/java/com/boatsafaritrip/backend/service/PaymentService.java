package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Booking;
import com.boatsafaritrip.backend.model.Payment;
import com.boatsafaritrip.backend.model.User;
import com.boatsafaritrip.backend.repository.BookingRepository;
import com.boatsafaritrip.backend.repository.PaymentRepository;
import com.boatsafaritrip.backend.repository.UserRepository;
import com.boatsafaritrip.backend.service.strategy.PaymentStrategyResolver;
import jakarta.persistence.Id;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service

public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationFactory notificationFactory;

    @Autowired
    private PaymentStrategyResolver paymentStrategyResolver;

    public List<Payment> getAllPayments(){
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id){
        return paymentRepository.findById(id).
                orElseThrow(() -> new PaymentNotFoundException("Payment not found with id " + id));
    }

    public Payment createPayment(Payment payment, String requesterEmail) {
        if (payment.getBooking() == null || payment.getBooking().getId() == null) {
            throw new IllegalArgumentException("A booking must be selected for this payment");
        }
        if (payment.getPaymentMethod() == null || payment.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        Booking booking = bookingRepository.findById(payment.getBooking().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected booking does not exist"));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if ("CUSTOMER".equals(requester.getRole()) && !booking.getCustomer().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("You can only pay for your own bookings");
        }
        if (!"CUSTOMER".equals(requester.getRole())) {
            throw new IllegalArgumentException("Only customers can make payments");
        }

        BigDecimal calculatedAmount = booking.getSafariPackage().getPrice()
                .multiply(BigDecimal.valueOf(booking.getNumberOfSeats()));

        payment.setBooking(booking);
        payment.setAmount(calculatedAmount);
        payment.setStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    public Payment verifyPayment(Long id) {
        Payment payment = getPaymentById(id);
        payment.setStatus("VERIFIED");
        Payment saved = paymentRepository.save(payment);

        notificationService.save(notificationFactory.createPaymentVerified(
                payment.getBooking().getCustomer(),
                payment.getBooking().getSafariPackage().getDestination(),
                payment.getAmount().toString()));

        return saved;
    }

    public Payment refundPayment(Long id) {
        Payment payment = getPaymentById(id);
        payment.setStatus("REFUNDED");
        Payment saved = paymentRepository.save(payment);

        notificationService.save(notificationFactory.createPaymentRefunded(
                payment.getBooking().getCustomer(),
                payment.getBooking().getSafariPackage().getDestination(),
                payment.getAmount().toString()));


        return saved;
    }

    public Payment processPaymentSimulation(Long id, String cardNumber) {
        Payment payment = getPaymentById(id);

        try { Thread.sleep(1500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        Map<String, String> details = new HashMap<>();
        details.put("cardNumber", cardNumber);
        boolean success = paymentStrategyResolver.resolve(payment.getPaymentMethod()).isSuccessful(details);

        if (success) {
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

    public List<Payment> getPaymentsByCustomer(Long customerId) {
        return paymentRepository.findByBooking_Customer_Id(customerId);
    }

    public void deletePendingPayment(Long id) {
        Payment payment = getPaymentById(id);
        if (!"PENDING".equals(payment.getStatus())) {
            throw new IllegalArgumentException("Only pending payments can be cancelled");
        }
        paymentRepository.delete(payment);
    }
}
