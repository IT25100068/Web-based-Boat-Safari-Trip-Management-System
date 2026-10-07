package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.Booking;
import com.boatsafaritrip.backend.model.Feedback;
import com.boatsafaritrip.backend.repository.BookingRepository;
import com.boatsafaritrip.backend.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    @PostMapping
    public Feedback submitFeedback(@RequestBody Feedback feedback) {
        if (feedback.getBooking() == null || feedback.getBooking().getId() == null) {
            throw new IllegalArgumentException("A booking must be specified");
        }
        if (feedback.getRating() == null || feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Booking booking = bookingRepository.findById(feedback.getBooking().getId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Feedback can only be given for confirmed trips");
        }
        if (feedbackRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new IllegalArgumentException("Feedback has already been submitted for this booking");
        }

        feedback.setBooking(booking);
        feedback.setSubmittedAt(LocalDateTime.now());
        return feedbackRepository.save(feedback);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }

    @DeleteMapping("/{id}")
    public void deleteFeedback(@PathVariable Long id) {
        feedbackRepository.deleteById(id);
    }
}