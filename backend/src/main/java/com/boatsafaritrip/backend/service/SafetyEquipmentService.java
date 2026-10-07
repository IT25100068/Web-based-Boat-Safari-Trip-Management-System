package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Boat;
import com.boatsafaritrip.backend.model.SafetyEquipment;
import com.boatsafaritrip.backend.repository.BoatRepository;
import com.boatsafaritrip.backend.repository.EquipmentTypeRepository;
import com.boatsafaritrip.backend.repository.SafetyEquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SafetyEquipmentService {

    @Autowired
    private SafetyEquipmentRepository equipmentRepository;

    @Autowired
    private BoatRepository boatRepository;

    @Autowired
    private EquipmentTypeRepository typeRepository;

    public List<SafetyEquipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public List<SafetyEquipment> getEquipmentByBoat(Long boatId) {
        List<SafetyEquipment> equipment = equipmentRepository.findByBoatId(boatId);
        equipment.forEach(e -> {
            if (e.getExpiryDate() != null && e.getExpiryDate().isBefore(LocalDate.now()) && "GOOD".equals(e.getCondition())) {
                e.setCondition("NEEDS_REPLACEMENT");
                equipmentRepository.save(e);
            }
        });
        return equipment;
    }

    public SafetyEquipment addEquipment(SafetyEquipment equipment) {
        if (equipment.getBoat() == null || equipment.getBoat().getId() == null) {
            throw new IllegalArgumentException("A boat must be selected");
        }
        if (equipment.getName() == null || typeRepository.findByName(equipment.getName()).isEmpty()) {
            throw new IllegalArgumentException("Equipment must be selected from the approved equipment catalog");
        }
        if (equipment.getQuantity() == null || equipment.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Boat boat = boatRepository.findById(equipment.getBoat().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected boat does not exist"));

        equipment.setBoat(boat);
        equipment.setCondition("GOOD");
        equipment.setStatus("ACTIVE");
        return equipmentRepository.save(equipment);
    }

    public SafetyEquipment updateCondition(Long id, String condition) {
        SafetyEquipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));
        equipment.setCondition(condition);
        return equipmentRepository.save(equipment);
    }

    public SafetyEquipment updateEquipment(Long id, Integer quantity, LocalDate expiryDate) {
        SafetyEquipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        equipment.setQuantity(quantity);
        equipment.setExpiryDate(expiryDate);
        // editing resets condition to GOOD only if it wasn't already flagged expired by the fix itself
        if (expiryDate == null || !expiryDate.isBefore(LocalDate.now())) {
            if ("NEEDS_REPLACEMENT".equals(equipment.getCondition())) {
                equipment.setCondition("GOOD");
            }
        }
        return equipmentRepository.save(equipment);
    }

    public SafetyEquipment retireEquipment(Long id) {
        SafetyEquipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));
        equipment.setStatus("RETIRED");
        return equipmentRepository.save(equipment);
    }

    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }
}