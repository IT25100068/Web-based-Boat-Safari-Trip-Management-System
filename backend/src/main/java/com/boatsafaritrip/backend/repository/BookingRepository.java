package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
