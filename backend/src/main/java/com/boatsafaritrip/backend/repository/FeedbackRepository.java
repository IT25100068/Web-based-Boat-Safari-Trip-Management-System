package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByBookingId(Long bookingId);
}