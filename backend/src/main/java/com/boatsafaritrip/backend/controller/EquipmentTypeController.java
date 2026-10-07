package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.EquipmentType;
import com.boatsafaritrip.backend.repository.EquipmentTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/equipment-types")
public class EquipmentTypeController {

    @Autowired
    private EquipmentTypeRepository typeRepository;

    @Autowired
    private com.boatsafaritrip.backend.repository.SafetyEquipmentRepository equipmentRepository;

    @GetMapping
    public List<EquipmentType> getAllTypes() {
        return typeRepository.findAll();
    }

    private static final Pattern VALID_NAME = Pattern.compile("^[A-Za-z0-9\\s\\-()/.]{3,60}$");

    @PostMapping
    public EquipmentType addType(@RequestBody EquipmentType type) {
        if (type.getName() == null || !VALID_NAME.matcher(type.getName().trim()).matches()) {
            throw new IllegalArgumentException("Equipment name must be 3-60 characters, letters/numbers/basic punctuation only");
        }
        if (typeRepository.findByName(type.getName()).isPresent()) {
            throw new IllegalArgumentException("This equipment type already exists");
        }
        type.setIsMandatory(false); // staff-added types are always additional, never mandatory
        return typeRepository.save(type);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }

    @DeleteMapping("/{id}")
    public void deleteType(@PathVariable Long id) {
        EquipmentType type = typeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment type not found"));

        if (Boolean.TRUE.equals(type.getIsMandatory())) {
            throw new IllegalArgumentException("Mandatory equipment types cannot be removed from the catalog");
        }

        boolean inUse = equipmentRepository.findAll().stream()
                .anyMatch(e -> e.getName().equals(type.getName()));
        if (inUse) {
            throw new IllegalArgumentException("This equipment type is currently in use on one or more boats and cannot be deleted");
        }

        typeRepository.delete(type);
    }
}