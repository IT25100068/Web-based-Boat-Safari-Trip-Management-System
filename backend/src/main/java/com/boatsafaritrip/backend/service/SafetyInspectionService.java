package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.*;
import com.boatsafaritrip.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SafetyInspectionService {

    @Autowired
    private SafetyInspectionRepository inspectionRepository;
    @Autowired
    private BoatRepository boatRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SafetyEquipmentRepository equipmentRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EquipmentTypeRepository typeRepository;

    public List<SafetyInspection> getAllInspections() {
        return inspectionRepository.findAll();
    }

    public SafetyInspection createInspection(SafetyInspection inspection, String inspectorEmail) {
        if (inspection.getBoat() == null || inspection.getBoat().getId() == null) {
            throw new IllegalArgumentException("A boat must be selected");
        }

        Boat boat = boatRepository.findById(inspection.getBoat().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected boat does not exist"));

        User inspector = userRepository.findByEmail(inspectorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Inspector not found"));

        List<SafetyEquipment> equipment = equipmentRepository.findByBoatId(boat.getId());
        List<SafetyEquipment> activeEquipment = equipment.stream()
                .filter(e -> "ACTIVE".equals(e.getStatus()))
                .toList();

        List<EquipmentType> mandatoryTypes = typeRepository.findByIsMandatoryTrue();
        List<String> missingMandatory = mandatoryTypes.stream()
                .map(EquipmentType::getName)
                .filter(name -> activeEquipment.stream().noneMatch(e -> e.getName().equals(name)))
                .toList();

        boolean allMandatoryPresent = missingMandatory.isEmpty();
        boolean allGoodCondition = activeEquipment.stream().allMatch(e -> "GOOD".equals(e.getCondition()));
        boolean noneExpired = activeEquipment.stream().allMatch(e ->
                e.getExpiryDate() == null || !e.getExpiryDate().isBefore(LocalDate.now()));

        int lifeJacketCount = activeEquipment.stream()
                .filter(e -> e.getName().toLowerCase().contains("life jacket"))
                .mapToInt(SafetyEquipment::getQuantity)
                .sum();
        boolean sufficientLifeJackets = lifeJacketCount >= boat.getCapacity();

        inspection.setBoat(boat);
        inspection.setInspector(inspector);
        inspection.setInspectionDate(LocalDate.now());
        inspection.setResult((allMandatoryPresent && allGoodCondition && noneExpired && sufficientLifeJackets) ? "PASSED" : "FAILED");

        StringBuilder autoNotes = new StringBuilder();
        if (!allMandatoryPresent) autoNotes.append("Missing mandatory equipment: ").append(String.join(", ", missingMandatory)).append(". ");
        if (!sufficientLifeJackets) autoNotes.append("Life jackets (").append(lifeJacketCount).append(") below boat capacity (").append(boat.getCapacity()).append("). ");

        if (autoNotes.length() > 0) {
            inspection.setNotes((inspection.getNotes() == null ? "" : inspection.getNotes() + " ") + "[Auto-flag: " + autoNotes.toString().trim() + "]");
        }

        return inspectionRepository.save(inspection);
    }

    public SafetyInspection voidInspection(Long id, String reason, String staffEmail) {
        if (reason == null || reason.trim().length() < 5) {
            throw new IllegalArgumentException("A reason (at least 5 characters) is required to void an inspection");
        }
        SafetyInspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspection not found"));
        if (Boolean.TRUE.equals(inspection.getVoided())) {
            throw new IllegalArgumentException("This inspection is already voided");
        }
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

        inspection.setVoided(true);
        inspection.setVoidReason(reason.trim());
        inspection.setVoidedBy(staff.getName());
        return inspectionRepository.save(inspection);
    }

    public boolean isBoatCompliant(Long boatId) {
        return inspectionRepository.findAll().stream()
                .filter(i -> i.getBoat().getId().equals(boatId))
                .filter(i -> !Boolean.TRUE.equals(i.getVoided()))
                .max((a, b) -> a.getId().compareTo(b.getId()))
                .map(i -> "PASSED".equals(i.getResult()))
                .orElse(false);
    }
}