package com.churninsight.controller;

public class ChurnPredictionResponse {
    private double churn_probability;
    private String customer_id;

    public ChurnPredictionResponse(double churn_probability, String customer_id) {
        this.churn_probability = churn_probability;
        this.customer_id = customer_id;
    }

    // Getters
    public double getChurn_probability() {
        return churn_probability;
    }

    public String getCustomer_id() {
        return customer_id;
    }
}