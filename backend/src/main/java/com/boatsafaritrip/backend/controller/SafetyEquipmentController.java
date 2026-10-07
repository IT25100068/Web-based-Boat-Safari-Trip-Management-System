package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.SafetyEquipment;
import com.boatsafaritrip.backend.service.SafetyEquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class SafetyEquipmentController {

    @Autowired
    private SafetyEquipmentService equipmentService;

    @GetMapping
    public List<SafetyEquipment> getAllEquipment(@RequestParam(required = false) Long boatId) {
        if (boatId != null) return equipmentService.getEquipmentByBoat(boatId);
        return equipmentService.getAllEquipment();
    }

    @PostMapping
    public SafetyEquipment addEquipment(@RequestBody SafetyEquipment equipment) {
        return equipmentService.addEquipment(equipment);
    }

    @PutMapping("/{id}/condition")
    public SafetyEquipment updateCondition(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return equipmentService.updateCondition(id, body.get("condition"));
    }

    @PutMapping("/{id}")
    public SafetyEquipment updateEquipment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Integer quantity = body.get("quantity") != null ? Integer.valueOf(body.get("quantity").toString()) : null;
        String expiryStr = (String) body.get("expiryDate");
        java.time.LocalDate expiryDate = (expiryStr != null && !expiryStr.isBlank()) ? java.time.LocalDate.parse(expiryStr) : null;
        return equipmentService.updateEquipment(id, quantity, expiryDate);
    }

    @PutMapping("/{id}/retire")
    public SafetyEquipment retireEquipment(@PathVariable Long id) {
        return equipmentService.retireEquipment(id);
    }

    @DeleteMapping("/{id}")
    public void deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }
}