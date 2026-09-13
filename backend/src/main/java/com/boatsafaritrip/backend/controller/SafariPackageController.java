package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.SafariPackage;
import com.boatsafaritrip.backend.service.PackageNotFoundException;
import com.boatsafaritrip.backend.service.SafariPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "http://localhost:5173")
public class SafariPackageController {

    @Autowired
    private SafariPackageService packageService;

    @GetMapping
    public List<SafariPackage> getAllPackages() {
        return packageService.getAllPackages();
    }

    @GetMapping("/{id}")
    public SafariPackage getPackage(@PathVariable Long id) {
        return packageService.getPackageById(id);
    }

    @PostMapping
    public SafariPackage createPackage(@RequestBody SafariPackage pkg) {
        return packageService.createPackage(pkg);
    }

    @PutMapping("/{id}")
    public SafariPackage updatePackage(@PathVariable Long id, @RequestBody SafariPackage pkg) {
        return packageService.updatePackage(id, pkg);
    }

    @PutMapping("/{id}/toggle-status")
    public SafariPackage toggleStatus(@PathVariable Long id) {
        return packageService.toggleStatus(id);
    }

    @DeleteMapping("/{id}")
    public void deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
    }

    @ExceptionHandler(PackageNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(PackageNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }
}