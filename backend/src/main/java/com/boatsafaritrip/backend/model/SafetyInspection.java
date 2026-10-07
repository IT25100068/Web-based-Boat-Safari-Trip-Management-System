package com.boatsafaritrip.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "safety_inspections")
public class SafetyInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "boat_id")
    private Boat boat;

    @ManyToOne
    @JoinColumn(name = "inspector_id")
    private User inspector;

    private LocalDate inspectionDate;
    private String notes;
    private String result; // PASSED, FAILED

    private Boolean voided = false;
    private String voidReason;
    private String voidedBy;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Boat getBoat() { return boat; }
    public void setBoat(Boat boat) { this.boat = boat; }

    public User getInspector() { return inspector; }
    public void setInspector(User inspector) { this.inspector = inspector; }

    public LocalDate getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDate inspectionDate) { this.inspectionDate = inspectionDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public Boolean getVoided() {
        return voided;
    }
    public void setVoided(Boolean voided) {
        this.voided = voided;
    }

    public String getVoidReason() { return voidReason; }
    public void setVoidReason(String voidReason) { this.voidReason = voidReason; }

    public String getVoidedBy() { return voidedBy; }
    public void setVoidedBy(String voidedBy) { this.voidedBy = voidedBy; }
}