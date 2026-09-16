package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Boat;
import com.boatsafaritrip.backend.repository.BoatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoatService {

    @Autowired
    private BoatRepository boatRepository;

    public List<Boat> getAllBoats() {
        return boatRepository.findAll();
    }

    public Boat getBoatById(Long id) {
        return boatRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Boat not found with id: " + id));
    }

    public Boat createBoat(Boat boat) {
        validate(boat);
        boat.setStatus("AVAILABLE");
        return boatRepository.save(boat);
    }

    public Boat updateBoat(Long id, Boat updated) {
        Boat boat = getBoatById(id);
        validate(updated);
        boat.setName(updated.getName());
        boat.setCapacity(updated.getCapacity());
        return boatRepository.save(boat);
    }

    public void deleteBoat(Long id) {
        Boat boat = getBoatById(id);
        if (!"AVAILABLE".equals(boat.getStatus())) {
            throw new IllegalArgumentException("Cannot delete a boat that is currently assigned");
        }
        boatRepository.delete(boat);
    }

    private void validate(Boat boat) {
        if (boat.getName() == null || boat.getName().isBlank()) {
            throw new IllegalArgumentException("Boat name is required");
        }
        if (boat.getCapacity() == null || boat.getCapacity() <= 0) {
            throw new IllegalArgumentException("Capacity must be greater than zero");
        }
    }
}