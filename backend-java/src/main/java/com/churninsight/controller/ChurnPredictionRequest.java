package com.churninsight.controller;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ChurnPredictionRequest {

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "1.0")
    private Double ageRisk;

    @PositiveOrZero
    private Double numOfProducts;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "1.0")
    private Double inactivo4070;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "1.0")
    private Double productsRiskFlag;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "1.0")
    private Double countryRiskFlag;
    
    // Nuevos campos (Fase 4)
    @NotNull
    private Double balance;

    @NotNull
    private Double estimatedSalary;

    @NotBlank
    private String country;

    @NotNull
    @PositiveOrZero
    private Integer tenure;

    @NotNull
    private Boolean isActiveMember;

    // Getters para campos originales
    public Double getAgeRisk() { return ageRisk; }
    public Double getNumOfProducts() { return numOfProducts; }
    public Double getInactivo4070() { return inactivo4070; }
    public Double getProductsRiskFlag() { return productsRiskFlag; }
    public Double getCountryRiskFlag() { return countryRiskFlag; }
    
    // Setters para campos originales
    public void setAgeRisk(Double ageRisk) { this.ageRisk = ageRisk; }
    public void setNumOfProducts(Double numOfProducts) { this.numOfProducts = numOfProducts; }
    public void setInactivo4070(Double inactivo4070) { this.inactivo4070 = inactivo4070; }
    public void setProductsRiskFlag(Double productsRiskFlag) { this.productsRiskFlag = productsRiskFlag; }
    public void setCountryRiskFlag(Double countryRiskFlag) { this.countryRiskFlag = countryRiskFlag; }
    
    // Getters para nuevos campos
    public Double getBalance() { return balance; }
    public Double getEstimatedSalary() { return estimatedSalary; }
    public String getCountry() { return country; }
    public Integer getTenure() { return tenure; }
    public Boolean getIsActiveMember() { return isActiveMember; }
    
    // Setters para nuevos campos
    public void setBalance(Double balance) { this.balance = balance; }
    public void setEstimatedSalary(Double estimatedSalary) { this.estimatedSalary = estimatedSalary; }
    public void setCountry(String country) { this.country = country; }
    public void setTenure(Integer tenure) { this.tenure = tenure; }
    public void setIsActiveMember(Boolean isActiveMember) { this.isActiveMember = isActiveMember; }
}