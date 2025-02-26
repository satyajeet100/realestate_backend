package com.example.realestate.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.realestate.exception.PropertyException;
import com.example.realestate.exception.UserException;
import com.example.realestate.model.Rating;
import com.example.realestate.model.Review;
import com.example.realestate.model.User;
import com.example.realestate.request.RatingRequest;
import com.example.realestate.service.RatingServices;
import com.example.realestate.service.UserService;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    
    private UserService userService;
    private RatingServices ratingServices;
    
    public RatingController(UserService userService, RatingServices ratingServices) {
        this.ratingServices = ratingServices;
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<Rating> createRatingHandler(@RequestBody RatingRequest req, @RequestHeader("Authorization") String jwt) throws UserException, PropertyException {
        User user = userService.findUserProfileByJwt(jwt);
        Rating rating = ratingServices.createRating(req, user);
        return new ResponseEntity<>(rating, HttpStatus.ACCEPTED);
    }
    
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Rating>> getPropertyReviewsHandler(@PathVariable Long propertyId) {
        List<Rating> ratings = ratingServices.getPropertyRatings(propertyId);
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }
}
