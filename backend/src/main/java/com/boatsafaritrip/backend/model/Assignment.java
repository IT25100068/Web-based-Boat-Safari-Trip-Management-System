package com.boatsafaritrip.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "boat_id")
    private Boat boat;

    @ManyToOne
    @JoinColumn(name = "captain_id")
    private Staff captain;

    @ManyToOne
    @JoinColumn(name = "guide_id")
    private Staff guide;

    @ManyToOne
    @JoinColumn(name = "safari_package_id")
    private SafariPackage safariPackage;


    private String status; // SCHEDULED, COMPLETED, CANCELLED

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Boat getBoat() { return boat; }
    public void setBoat(Boat boat) { this.boat = boat; }

    public Staff getCaptain() { return captain; }
    public void setCaptain(Staff captain) { this.captain = captain; }

    public Staff getGuide() { return guide; }
    public void setGuide(Staff guide) { this.guide = guide; }

    public SafariPackage getSafariPackage() {
        return safariPackage;
    }

    public void setSafariPackage(SafariPackage safariPackage) {
        this.safariPackage = safariPackage;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}