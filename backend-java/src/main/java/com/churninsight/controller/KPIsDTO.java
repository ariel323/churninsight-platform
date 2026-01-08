package com.churninsight.controller;

public class KPIsDTO {
    private long totalHighRiskClients;
    private double capitalAtRisk;
    private double accuracyLastMonth;
    private long totalPredictions;
    private double averageRisk;
    
    public KPIsDTO() {
    }
    
    public KPIsDTO(long totalHighRiskClients, double capitalAtRisk, double accuracyLastMonth, 
                   long totalPredictions, double averageRisk) {
        this.totalHighRiskClients = totalHighRiskClients;
        this.capitalAtRisk = capitalAtRisk;
        this.accuracyLastMonth = accuracyLastMonth;
        this.totalPredictions = totalPredictions;
        this.averageRisk = averageRisk;
    }
    
    // Getters and Setters
    public long getTotalHighRiskClients() {
        return totalHighRiskClients;
    }
    
    public void setTotalHighRiskClients(long totalHighRiskClients) {
        this.totalHighRiskClients = totalHighRiskClients;
    }
    
    public double getCapitalAtRisk() {
        return capitalAtRisk;
    }
    
    public void setCapitalAtRisk(double capitalAtRisk) {
        this.capitalAtRisk = capitalAtRisk;
    }
    
    public double getAccuracyLastMonth() {
        return accuracyLastMonth;
    }
    
    public void setAccuracyLastMonth(double accuracyLastMonth) {
        this.accuracyLastMonth = accuracyLastMonth;
    }
    
    public long getTotalPredictions() {
        return totalPredictions;
    }
    
    public void setTotalPredictions(long totalPredictions) {
        this.totalPredictions = totalPredictions;
    }
    
    public double getAverageRisk() {
        return averageRisk;
    }
    
    public void setAverageRisk(double averageRisk) {
        this.averageRisk = averageRisk;
    }
}
