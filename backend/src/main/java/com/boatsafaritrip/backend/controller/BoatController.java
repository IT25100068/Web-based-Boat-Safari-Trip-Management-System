package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.Boat;
import com.boatsafaritrip.backend.service.BoatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/boats")
@CrossOrigin(origins = "http://localhost:5173")
public class BoatController {

    @Autowired
    private BoatService boatService;

    @GetMapping
    public List<Boat> getAllBoats() {
        return boatService.getAllBoats();
    }

    @PostMapping
    public Boat createBoat(@RequestBody Boat boat) {
        return boatService.createBoat(boat);
    }

    @PutMapping("/{id}")
    public Boat updateBoat(@PathVariable Long id, @RequestBody Boat boat) {
        return boatService.updateBoat(id, boat);
    }

    @DeleteMapping("/{id}")
    public void deleteBoat(@PathVariable Long id) {
        boatService.deleteBoat(id);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }
}