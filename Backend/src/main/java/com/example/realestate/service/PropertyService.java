package com.example.realestate.service;

import com.example.realestate.exception.PropertyException;
import com.example.realestate.model.Property;
import com.example.realestate.user.domain.PropertyStatus;
import com.example.realestate.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class PropertyService {

    @Autowired
    private PropertyRepository propertyRepository;

    private static final Logger logger = Logger.getLogger(PropertyService.class.getName());
    private static final String UPLOAD_DIR = "uploads/";
    private static final String BASE_URL = "http://localhost:9090/uploads/";

    public Property addProperty(Property property, MultipartFile[] images) {
        List<String> imageUrls = new ArrayList<>();

        if (images != null && images.length > 0) {
            createUploadDirectoryIfNeeded();
            imageUrls = saveImages(images);
        }

        property.setImageUrls(imageUrls);
        property.setStatus(PropertyStatus.ACTIVE); // Default status when adding a property
        return propertyRepository.save(property);
    }

    // Updated method to handle property updates with images
    public Property updateProperty(Property property, MultipartFile[] images) {
        // Fetch the existing property to preserve fields not sent in the request
        Optional<Property> existingPropertyOpt = propertyRepository.findById(property.getId());
        if (existingPropertyOpt.isEmpty()) {
            throw new RuntimeException("Property not found with ID: " + property.getId());
        }
        Property existingProperty = existingPropertyOpt.get();

        // Update fields
        existingProperty.setPropertyTitle(property.getPropertyTitle());
        existingProperty.setDescription(property.getDescription());
        existingProperty.setPrice(property.getPrice());
        existingProperty.setDiscountedPrice(property.getDiscountedPrice());
        existingProperty.setDiscountPercent(property.getDiscountPercent());
        existingProperty.setLocation(property.getLocation());
        existingProperty.setPropertyCategory(property.getPropertyCategory());
        existingProperty.setNumberOfBedrooms(property.getNumberOfBedrooms());
        existingProperty.setNumberOfBathrooms(property.getNumberOfBathrooms());
        existingProperty.setSquareFeet(property.getSquareFeet());
        existingProperty.setPropertyType(property.getPropertyType());
        existingProperty.setSeller(property.getSeller());

        // Handle images: Replace existing images if new ones are provided
        if (images != null && images.length > 0) {
            createUploadDirectoryIfNeeded();
            List<String> newImageUrls = saveImages(images);
            existingProperty.setImageUrls(newImageUrls); // Replace old images
        } // Else, keep existing images

        return propertyRepository.save(existingProperty);
    }

    // Keep the old method for backward compatibility (if needed)
    public Property updateProperty(Property property) {
        return propertyRepository.save(property);
    }

    public Property findPropertyById(Long id) throws PropertyException {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new PropertyException("Property not found with ID: " + id));
    }

    public Optional<Property> getPropertyById(Long id) {
        return propertyRepository.findById(id);
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public List<Property> getPropertiesByType(String type) {
        return propertyRepository.findByPropertyType(type);
    }

    public boolean deleteProperty(Long id) {
        if (propertyRepository.existsById(id)) {
            propertyRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Property updatePropertyStatus(Long id, PropertyStatus status) throws PropertyException {
        Property property = findPropertyById(id);
        property.setStatus(status);
        return propertyRepository.save(property);
    }

    private void createUploadDirectoryIfNeeded() {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
                logger.info("Upload directory created at: " + UPLOAD_DIR);
            } catch (IOException e) {
                logger.severe("Failed to create upload directory: " + e.getMessage());
                throw new RuntimeException("Could not create upload directory", e);
            }
        }
    }

    private List<String> saveImages(MultipartFile[] images) {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile image : images) {
            try {
                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path destinationPath = Paths.get(UPLOAD_DIR, fileName);
                Files.copy(image.getInputStream(), destinationPath);
                imageUrls.add(BASE_URL + fileName);
            } catch (IOException e) {
                logger.severe("Failed to store file: " + image.getOriginalFilename() + " - " + e.getMessage());
                throw new RuntimeException("Failed to store file: " + image.getOriginalFilename(), e);
            }
        }

        return imageUrls;
    }
}