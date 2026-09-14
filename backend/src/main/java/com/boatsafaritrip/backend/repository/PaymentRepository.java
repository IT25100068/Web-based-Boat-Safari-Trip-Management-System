package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
