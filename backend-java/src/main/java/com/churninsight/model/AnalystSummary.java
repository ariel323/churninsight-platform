package com.churninsight.model;

import java.time.LocalDateTime;

/**
 * Resumen por analista para vista de ADMIN
 */
public class AnalystSummary {
    private String username;
    private String fullName;
    private String email;
    private long totalAnalyses;
    private LocalDateTime lastPredictionDate;
    private Double averageChurnProbability;

    public AnalystSummary(String username, String fullName, String email, long totalAnalyses,
                          LocalDateTime lastPredictionDate, Double averageChurnProbability) {
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.totalAnalyses = totalAnalyses;
        this.lastPredictionDate = lastPredictionDate;
        this.averageChurnProbability = averageChurnProbability;
    }

    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public long getTotalAnalyses() { return totalAnalyses; }
    public LocalDateTime getLastPredictionDate() { return lastPredictionDate; }
    public Double getAverageChurnProbability() { return averageChurnProbability; }
}
