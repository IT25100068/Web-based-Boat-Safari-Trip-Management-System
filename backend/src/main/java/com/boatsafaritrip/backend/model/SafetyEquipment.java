package com.boatsafaritrip.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "safety_equipment")
public class SafetyEquipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "boat_id")
    private Boat boat;

    private String name; // e.g. "Life Jacket - Adult", "Fire Extinguisher (5kg)", "Flare Kit"
    private String category; // e.g. LIFESAVING, FIRE_SAFETY, NAVIGATION, EMERGENCY
    private Integer quantity;
    private LocalDate expiryDate; // nullable — not all equipment expires
    @Column(name = "equipment_condition") // Avoids the MySQL reserved keyword
    private String condition;// GOOD, NEEDS_REPLACEMENT, DAMAGED
    private String status; // ACTIVE, RETIRED

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Boat getBoat() { return boat; }
    public void setBoat(Boat boat) { this.boat = boat; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}