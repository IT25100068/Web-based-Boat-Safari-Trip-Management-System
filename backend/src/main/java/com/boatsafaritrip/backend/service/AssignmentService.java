package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Assignment;
import com.boatsafaritrip.backend.model.Boat;
import com.boatsafaritrip.backend.model.Staff;
import com.boatsafaritrip.backend.repository.AssignmentRepository;
import com.boatsafaritrip.backend.repository.BoatRepository;
import com.boatsafaritrip.backend.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private BoatRepository boatRepository;
    @Autowired
    private StaffRepository staffRepository;

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + id));
    }

    public Assignment createAssignment(Assignment assignment) {
        if (assignment.getTripDate() == null || assignment.getTripDestination() == null
                || assignment.getTripDestination().isBlank()) {
            throw new IllegalArgumentException("Trip date and destination are required");
        }
        if (assignment.getBoat() == null || assignment.getBoat().getId() == null) {
            throw new IllegalArgumentException("A boat must be selected");
        }
        if (assignment.getCaptain() == null || assignment.getCaptain().getId() == null) {
            throw new IllegalArgumentException("A captain must be assigned");
        }

        Boat boat = boatRepository.findById(assignment.getBoat().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected boat does not exist"));
        if (!"AVAILABLE".equals(boat.getStatus())) {
            throw new IllegalArgumentException("Selected boat is not available");
        }

        Staff captain = staffRepository.findById(assignment.getCaptain().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected captain does not exist"));
        if (!"AVAILABLE".equals(captain.getAvailability())) {
            throw new IllegalArgumentException("Selected captain is not available");
        }

        if (assignment.getGuide() != null && assignment.getGuide().getId() != null) {
            Staff guide = staffRepository.findById(assignment.getGuide().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected guide does not exist"));
            if (!"AVAILABLE".equals(guide.getAvailability())) {
                throw new IllegalArgumentException("Selected guide is not available");
            }
            guide.setAvailability("ASSIGNED");
            staffRepository.save(guide);
            assignment.setGuide(guide);
        }

        boat.setStatus("ASSIGNED");
        boatRepository.save(boat);

        captain.setAvailability("ASSIGNED");
        staffRepository.save(captain);

        assignment.setBoat(boat);
        assignment.setCaptain(captain);
        assignment.setStatus("SCHEDULED");
        return assignmentRepository.save(assignment);
    }

    public Assignment completeAssignment(Long id) {
        Assignment assignment = getAssignmentById(id);
        releaseResources(assignment);
        assignment.setStatus("COMPLETED");
        return assignmentRepository.save(assignment);
    }

    public Assignment cancelAssignment(Long id) {
        Assignment assignment = getAssignmentById(id);
        releaseResources(assignment);
        assignment.setStatus("CANCELLED");
        return assignmentRepository.save(assignment);
    }

    private void releaseResources(Assignment assignment) {
        Boat boat = assignment.getBoat();
        boat.setStatus("AVAILABLE");
        boatRepository.save(boat);

        Staff captain = assignment.getCaptain();
        captain.setAvailability("AVAILABLE");
        staffRepository.save(captain);

        if (assignment.getGuide() != null) {
            Staff guide = assignment.getGuide();
            guide.setAvailability("AVAILABLE");
            staffRepository.save(guide);
        }
    }
}