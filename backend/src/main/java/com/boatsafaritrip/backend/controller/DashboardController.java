package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.Booking;
import com.boatsafaritrip.backend.model.Payment;
import com.boatsafaritrip.backend.repository.BookingRepository;
import com.boatsafaritrip.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/customer/{customerId}")
    public Map<String, Object> getCustomerDashboard(@PathVariable Long customerId) {
        List<Booking> bookings = bookingRepository.findByCustomerId(customerId);
        List<Payment> payments = paymentRepository.findByBooking_Customer_Id(customerId);

        long upcomingTrips = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()) && b.getTripDate() != null && !b.getTripDate().isBefore(LocalDate.now()))
                .count();

        BigDecimal totalSpent = payments.stream()
                .filter(p -> "VERIFIED".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> recentBookings = bookings.stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .limit(5)
                .map(b -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", b.getId());
                    m.put("destination", b.getSafariPackage() != null ? b.getSafariPackage().getDestination() : "—");
                    m.put("tripDate", b.getTripDate());
                    m.put("status", b.getStatus());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalBookings", bookings.size());
        result.put("upcomingTrips", upcomingTrips);
        result.put("totalSpent", totalSpent);
        result.put("totalPayments", payments.size());
        result.put("recentBookings", recentBookings);
        return result;
    }

    @GetMapping("/staff")
    public Map<String, Object> getStaffDashboard() {
        List<Booking> bookings = bookingRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();

        long pendingBookings = bookings.stream().filter(b -> "PENDING".equals(b.getStatus())).count();
        long confirmedBookings = bookings.stream().filter(b -> "CONFIRMED".equals(b.getStatus())).count();

        BigDecimal totalRevenue = payments.stream()
                .filter(p -> "VERIFIED".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingPayments = payments.stream().filter(p -> "PENDING".equals(p.getStatus())).count();

        List<Map<String, Object>> recentBookings = bookings.stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .limit(6)
                .map(b -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", b.getId());
                    m.put("customer", b.getCustomer() != null ? b.getCustomer().getName() : "—");
                    m.put("destination", b.getSafariPackage() != null ? b.getSafariPackage().getDestination() : "—");
                    m.put("status", b.getStatus());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalBookings", bookings.size());
        result.put("pendingBookings", pendingBookings);
        result.put("confirmedBookings", confirmedBookings);
        result.put("totalRevenue", totalRevenue);
        result.put("pendingPayments", pendingPayments);
        result.put("recentBookings", recentBookings);
        return result;
    }
}