package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.SafetyInspection;
import com.boatsafaritrip.backend.service.SafetyInspectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inspections")
@CrossOrigin(origins = "http://localhost:5173")
public class SafetyInspectionController {

    @Autowired
    private SafetyInspectionService inspectionService;

    @GetMapping
    public List<SafetyInspection> getAllInspections() {
        return inspectionService.getAllInspections();
    }

    @PostMapping
    public SafetyInspection createInspection(@RequestBody SafetyInspection inspection) {
        return inspectionService.createInspection(inspection);
    }

    @GetMapping("/boat/{boatId}/compliant")
    public Map<String, Boolean> checkCompliance(@PathVariable Long boatId) {
        Map<String, Boolean> result = new HashMap<>();
        result.put("compliant", inspectionService.isBoatCompliant(boatId));
        return result;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }

    @DeleteMapping("/{id}")
    public void deleteInspection(@PathVariable Long id) {
        inspectionService.deleteInspection(id);
    }
}