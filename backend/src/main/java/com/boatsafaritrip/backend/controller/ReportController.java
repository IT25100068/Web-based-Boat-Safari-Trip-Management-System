package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.Booking;
import com.boatsafaritrip.backend.model.Payment;
import com.boatsafaritrip.backend.repository.BookingRepository;
import com.boatsafaritrip.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/payments-summary")
    public Map<String, Object> getPaymentsSummary() {
        List<Payment> payments = paymentRepository.findAll();

        BigDecimal totalRevenue = payments.stream()
                .filter(p -> "VERIFIED".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long verifiedCount = payments.stream().filter(p -> "VERIFIED".equals(p.getStatus())).count();
        long pendingCount = payments.stream().filter(p -> "PENDING".equals(p.getStatus())).count();
        long refundedCount = payments.stream().filter(p -> "REFUNDED".equals(p.getStatus())).count();
        long failedCount = payments.stream().filter(p -> "FAILED".equals(p.getStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("verifiedCount", verifiedCount);
        summary.put("pendingCount", pendingCount);
        summary.put("refundedCount", refundedCount);
        summary.put("failedCount", failedCount);
        summary.put("totalPayments", payments.size());
        return summary;
    }

    @GetMapping("/bookings-summary")
    public Map<String, Object> getBookingsSummary() {
        List<Booking> bookings = bookingRepository.findAll();

        long confirmedCount = bookings.stream().filter(b -> "CONFIRMED".equals(b.getStatus())).count();
        long pendingCount = bookings.stream().filter(b -> "PENDING".equals(b.getStatus())).count();
        long cancelledCount = bookings.stream().filter(b -> "CANCELLED".equals(b.getStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalBookings", bookings.size());
        summary.put("confirmedCount", confirmedCount);
        summary.put("pendingCount", pendingCount);
        summary.put("cancelledCount", cancelledCount);
        return summary;
    }
}