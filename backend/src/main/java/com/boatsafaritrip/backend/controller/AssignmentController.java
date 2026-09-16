package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.Assignment;
import com.boatsafaritrip.backend.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @GetMapping
    public List<Assignment> getAllAssignments() {
        return assignmentService.getAllAssignments();
    }

    @PostMapping
    public Assignment createAssignment(@RequestBody Assignment assignment) {
        return assignmentService.createAssignment(assignment);
    }

    @PutMapping("/{id}/complete")
    public Assignment completeAssignment(@PathVariable Long id) {
        return assignmentService.completeAssignment(id);
    }

    @PutMapping("/{id}/cancel")
    public Assignment cancelAssignment(@PathVariable Long id) {
        return assignmentService.cancelAssignment(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }
}