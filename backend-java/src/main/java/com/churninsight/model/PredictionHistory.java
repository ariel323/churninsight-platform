package com.churninsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_history")
public class PredictionHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String customerId;
    
    @Column(nullable = false)
    private Double churnProbability;
    
    @Column(nullable = false)
    private Double ageRisk;
    
    @Column(nullable = false)
    private Integer numOfProducts;
    
    @Column(nullable = false)
    private Double inactivo4070;
    
    @Column(nullable = false)
    private Double productsRiskFlag;
    
    @Column(nullable = false)
    private Double countryRiskFlag;
    
    @Column(nullable = false)
    private LocalDateTime predictionDate;
    
    @Column(nullable = false)
    private String username;
    
    // Constructors
    public PredictionHistory() {
    }
    
    public PredictionHistory(String customerId, Double churnProbability, Double ageRisk, 
                           Integer numOfProducts, Double inactivo4070, Double productsRiskFlag, 
                           Double countryRiskFlag, String username) {
        this.customerId = customerId;
        this.churnProbability = churnProbability;
        this.ageRisk = ageRisk;
        this.numOfProducts = numOfProducts;
        this.inactivo4070 = inactivo4070;
        this.productsRiskFlag = productsRiskFlag;
        this.countryRiskFlag = countryRiskFlag;
        this.predictionDate = LocalDateTime.now();
        this.username = username;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
    
    public Double getChurnProbability() {
        return churnProbability;
    }
    
    public void setChurnProbability(Double churnProbability) {
        this.churnProbability = churnProbability;
    }
    
    public Double getAgeRisk() {
        return ageRisk;
    }
    
    public void setAgeRisk(Double ageRisk) {
        this.ageRisk = ageRisk;
    }
    
    public Integer getNumOfProducts() {
        return numOfProducts;
    }
    
    public void setNumOfProducts(Integer numOfProducts) {
        this.numOfProducts = numOfProducts;
    }
    
    public Double getInactivo4070() {
        return inactivo4070;
    }
    
    public void setInactivo4070(Double inactivo4070) {
        this.inactivo4070 = inactivo4070;
    }
    
    public Double getProductsRiskFlag() {
        return productsRiskFlag;
    }
    
    public void setProductsRiskFlag(Double productsRiskFlag) {
        this.productsRiskFlag = productsRiskFlag;
    }
    
    public Double getCountryRiskFlag() {
        return countryRiskFlag;
    }
    
    public void setCountryRiskFlag(Double countryRiskFlag) {
        this.countryRiskFlag = countryRiskFlag;
    }
    
    public LocalDateTime getPredictionDate() {
        return predictionDate;
    }
    
    public void setPredictionDate(LocalDateTime predictionDate) {
        this.predictionDate = predictionDate;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
}
