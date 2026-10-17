package com.agriguid.controller;

import com.agriguid.model.Crop;
import com.agriguid.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/crops")
@CrossOrigin(origins = "*")
public class CropController {
    
    @Autowired
    private CropService cropService;
    
    @GetMapping
    public ResponseEntity<List<Crop>> getAllCrops() {
        return ResponseEntity.ok(cropService.getAllCrops());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Crop> getCropById(@PathVariable Long id) {
        return cropService.getCropById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Crop> createCrop(@RequestBody Crop crop) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(cropService.saveCrop(crop));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Crop> updateCrop(@PathVariable Long id, @RequestBody Crop crop) {
        return ResponseEntity.ok(cropService.updateCrop(id, crop));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCrop(@PathVariable Long id) {
        cropService.deleteCrop(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Crop>> searchCrops(@RequestParam String name) {
        return ResponseEntity.ok(cropService.searchCropsByName(name));
    }
    
    @GetMapping("/soil/{soilType}")
    public ResponseEntity<List<Crop>> getCropsBySoil(@PathVariable String soilType) {
        return ResponseEntity.ok(cropService.getCropsBySoilType(soilType));
    }
    
    @GetMapping("/climate/{climate}")
    public ResponseEntity<List<Crop>> getCropsByClimate(@PathVariable String climate) {
        return ResponseEntity.ok(cropService.getCropsByClimate(climate));
    }
    
    @GetMapping("/suitable")
    public ResponseEntity<List<Crop>> getSuitableCrops(
            @RequestParam String soilType,
            @RequestParam String climate) {
        return ResponseEntity.ok(cropService.getCropsBySoilAndClimate(soilType, climate));
    }
}