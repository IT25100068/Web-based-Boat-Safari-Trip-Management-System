package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Boat;
import com.boatsafaritrip.backend.model.SafetyInspection;
import com.boatsafaritrip.backend.repository.BoatRepository;
import com.boatsafaritrip.backend.repository.SafetyInspectionRepository;
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

    public List<SafetyInspection> getAllInspections() {
        return inspectionRepository.findAll();
    }

    public SafetyInspection getInspectionById(Long id) {
        return inspectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inspection not found with id: " + id));
    }

    public SafetyInspection createInspection(SafetyInspection inspection) {
        if (inspection.getBoat() == null || inspection.getBoat().getId() == null) {
            throw new IllegalArgumentException("A boat must be selected");
        }
        if (inspection.getInspectorName() == null || inspection.getInspectorName().isBlank()) {
            throw new IllegalArgumentException("Inspector name is required");
        }

        Boat boat = boatRepository.findById(inspection.getBoat().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected boat does not exist"));

        boolean allChecksPassed = Boolean.TRUE.equals(inspection.getLifeJacketsChecked())
                && Boolean.TRUE.equals(inspection.getFireExtinguisherChecked())
                && Boolean.TRUE.equals(inspection.getFirstAidKitChecked())
                && Boolean.TRUE.equals(inspection.getEngineChecked());

        inspection.setBoat(boat);
        inspection.setInspectionDate(LocalDate.now());
        inspection.setResult(allChecksPassed ? "PASSED" : "FAILED");

        return inspectionRepository.save(inspection);
    }

    public boolean isBoatCompliant(Long boatId) {
        List<SafetyInspection> inspections = inspectionRepository.findAll();
        return inspections.stream()
                .filter(i -> i.getBoat().getId().equals(boatId))
                .anyMatch(i -> "PASSED".equals(i.getResult()));
    }

    public void deleteInspection(Long id) {
        SafetyInspection inspection = getInspectionById(id);
        inspectionRepository.delete(inspection);
    }
}