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

    private LocalDate inspectionDate;
    private Boolean lifeJacketsChecked;
    private Boolean fireExtinguisherChecked;
    private Boolean firstAidKitChecked;
    private Boolean engineChecked;
    private String inspectorName;
    private String notes;
    private String result; // PASSED, FAILED

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Boat getBoat() { return boat; }
    public void setBoat(Boat boat) { this.boat = boat; }

    public LocalDate getInspectionDate() { return inspectionDate; }
    public void setInspectionDate(LocalDate inspectionDate) { this.inspectionDate = inspectionDate; }

    public Boolean getLifeJacketsChecked() { return lifeJacketsChecked; }
    public void setLifeJacketsChecked(Boolean lifeJacketsChecked) { this.lifeJacketsChecked = lifeJacketsChecked; }

    public Boolean getFireExtinguisherChecked() { return fireExtinguisherChecked; }
    public void setFireExtinguisherChecked(Boolean fireExtinguisherChecked) { this.fireExtinguisherChecked = fireExtinguisherChecked; }

    public Boolean getFirstAidKitChecked() { return firstAidKitChecked; }
    public void setFirstAidKitChecked(Boolean firstAidKitChecked) { this.firstAidKitChecked = firstAidKitChecked; }

    public Boolean getEngineChecked() { return engineChecked; }
    public void setEngineChecked(Boolean engineChecked) { this.engineChecked = engineChecked; }

    public String getInspectorName() { return inspectorName; }
    public void setInspectorName(String inspectorName) { this.inspectorName = inspectorName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
}