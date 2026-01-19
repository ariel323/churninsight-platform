package com.churninsight.controller;

public class ChurnPredictionRequest {
    // Campos crudos para computar características
    private int age;
    private String gender;
    private double balance;
    private int numOfProducts;
    private String country;
    private int isActiveMember;
    private double estimatedSalary;
    private int tenure;
    private int creditScore;
    
    // Nuevos campos dinámicos (opcionales, con valores por defecto)
    private Double deltaBalance;
    private Double deltaNumOfProducts;
    private Boolean recentInactive;
    private Boolean productUsageDrop;
    private Boolean hadComplaint;
    
    // Características derivadas (computadas en el backend)
    private double ageRisk;
    private double inactivo4070;
    private double productsRiskFlag;
    private double countryRiskFlag;

    // Getters para campos crudos
    public int getAge() { return age; }
    public String getGender() { return gender; }
    public double getBalance() { return balance; }
    public int getNumOfProducts() { return numOfProducts; }
    public String getCountry() { return country; }
    public int getIsActiveMember() { return isActiveMember; }
    public double getEstimatedSalary() { return estimatedSalary; }
    public int getTenure() { return tenure; }
    public int getCreditScore() { return creditScore; }
    
    // Setters para campos crudos
    public void setAge(int age) { this.age = age; }
    public void setGender(String gender) { this.gender = gender; }
    public void setBalance(double balance) { this.balance = balance; }
    public void setNumOfProducts(int numOfProducts) { this.numOfProducts = numOfProducts; }
    public void setCountry(String country) { this.country = country; }
    public void setIsActiveMember(int isActiveMember) { this.isActiveMember = isActiveMember; }
    public void setEstimatedSalary(double estimatedSalary) { this.estimatedSalary = estimatedSalary; }
    public void setTenure(int tenure) { this.tenure = tenure; }
    public void setCreditScore(int creditScore) { this.creditScore = creditScore; }
    
    // Getters para características derivadas
    public double getAgeRisk() { return ageRisk; }
    public double getInactivo4070() { return inactivo4070; }
    public double getProductsRiskFlag() { return productsRiskFlag; }
    public double getCountryRiskFlag() { return countryRiskFlag; }
    
    // Método para computar características derivadas
    public void computeDerivedFeatures() {
        this.ageRisk = (age >= 40 && age <= 70) ? 1.0 : 0.0;
        this.inactivo4070 = (age >= 40 && age <= 70 && isActiveMember == 0) ? 1.0 : 0.0;
        this.productsRiskFlag = (numOfProducts >= 3) ? 1.0 : 0.0;
        this.countryRiskFlag = "Germany".equals(country) ? 1.0 : 0.0;
    }
    
    // Getters y setters para campos dinámicos
    public Double getDeltaBalance() { return deltaBalance != null ? deltaBalance : 0.0; }
    public void setDeltaBalance(Double deltaBalance) { this.deltaBalance = deltaBalance; }
    
    public Double getDeltaNumOfProducts() { return deltaNumOfProducts != null ? deltaNumOfProducts : 0.0; }
    public void setDeltaNumOfProducts(Double deltaNumOfProducts) { this.deltaNumOfProducts = deltaNumOfProducts; }
    
    public Boolean getRecentInactive() { return recentInactive != null ? recentInactive : false; }
    public void setRecentInactive(Boolean recentInactive) { this.recentInactive = recentInactive; }
    
    public Boolean getProductUsageDrop() { return productUsageDrop != null ? productUsageDrop : false; }
    public void setProductUsageDrop(Boolean productUsageDrop) { this.productUsageDrop = productUsageDrop; }
    
    public Boolean getHadComplaint() { return hadComplaint != null ? hadComplaint : false; }
    public void setHadComplaint(Boolean hadComplaint) { this.hadComplaint = hadComplaint; }
}