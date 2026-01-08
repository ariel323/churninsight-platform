package com.churninsight.controller;

public class ChurnPredictionRequest {
    private double ageRisk;
    private double numOfProducts;
    private double inactivo4070;
    private double productsRiskFlag;
    private double countryRiskFlag;
    
    // Nuevos campos (Fase 4)
    private Double balance;
    private Double estimatedSalary;
    private String country;
    private Integer tenure;
    private Boolean isActiveMember;

    // Getters para campos originales
    public double getAgeRisk() { return ageRisk; }
    public double getNumOfProducts() { return numOfProducts; }
    public double getInactivo4070() { return inactivo4070; }
    public double getProductsRiskFlag() { return productsRiskFlag; }
    public double getCountryRiskFlag() { return countryRiskFlag; }
    
    // Setters para campos originales
    public void setAgeRisk(double ageRisk) { this.ageRisk = ageRisk; }
    public void setNumOfProducts(double numOfProducts) { this.numOfProducts = numOfProducts; }
    public void setInactivo4070(double inactivo4070) { this.inactivo4070 = inactivo4070; }
    public void setProductsRiskFlag(double productsRiskFlag) { this.productsRiskFlag = productsRiskFlag; }
    public void setCountryRiskFlag(double countryRiskFlag) { this.countryRiskFlag = countryRiskFlag; }
    
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