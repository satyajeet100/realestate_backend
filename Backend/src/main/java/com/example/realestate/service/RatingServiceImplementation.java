package com.example.realestate.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.realestate.exception.PropertyException;
import com.example.realestate.model.Property;
import com.example.realestate.model.Rating;
import com.example.realestate.model.User;
import com.example.realestate.repository.RatingRepository;
import com.example.realestate.request.RatingRequest;

@Service
public class RatingServiceImplementation implements RatingServices {
    
    private final RatingRepository ratingRepository;
    private final PropertyService propertyService;

    public RatingServiceImplementation(RatingRepository ratingRepository, PropertyService propertyService) {
        this.ratingRepository = ratingRepository;
        this.propertyService = propertyService;
    }

    @Override
    public Rating createRating(RatingRequest req, User user) throws PropertyException {
        Property property = propertyService.findPropertyById(req.getPropertyId());
        
        Rating rating = new Rating();
        rating.setProperty(property);
        rating.setUser(user);
        rating.setRating(req.getRating());
        rating.setCreatedAt(LocalDateTime.now());
        
        return ratingRepository.save(rating);
    }

    @Override
    public List<Rating> getPropertyRatings(Long propertyId) {
        return ratingRepository.getAllPropertyRatings(propertyId);
    }
}
