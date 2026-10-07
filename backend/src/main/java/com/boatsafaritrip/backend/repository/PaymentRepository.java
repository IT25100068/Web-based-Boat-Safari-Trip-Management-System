package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBooking_Customer_Id(Long customerId);
    Optional<Payment> findByBookingId(Long bookingId);
}