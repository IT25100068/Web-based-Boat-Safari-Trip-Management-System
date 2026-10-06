package com.boatsafaritrip.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "safari_package_id")
    private SafariPackage safariPackage;

    private LocalDate tripDate;
    private Integer numberOfSeats;
    private String status; // PENDING, CONFIRMED, CANCELLED
    private LocalDate bookingDate;

    private String createdBy; //'CUSTOMER' or 'STAFF'

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public SafariPackage getSafariPackage() { return safariPackage; }
    public void setSafariPackage(SafariPackage safariPackage) { this.safariPackage = safariPackage; }

    public LocalDate getTripDate() { return tripDate; }
    public void setTripDate(LocalDate tripDate) { this.tripDate = tripDate; }

    public Integer getNumberOfSeats() { return numberOfSeats; }
    public void setNumberOfSeats(Integer numberOfSeats) { this.numberOfSeats = numberOfSeats; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}