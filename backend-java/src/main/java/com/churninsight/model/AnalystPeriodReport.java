package com.churninsight.model;

public class AnalystPeriodReport {
    private Integer year;
    private Integer month; // null for yearly aggregation
    private Long totalAnalyses;
    private Long highRiskCount;
    private Double averageChurnProbability;

    public AnalystPeriodReport(Integer year, Integer month, Long totalAnalyses, Long highRiskCount, Double averageChurnProbability) {
        this.year = year;
        this.month = month;
        this.totalAnalyses = totalAnalyses;
        this.highRiskCount = highRiskCount;
        this.averageChurnProbability = averageChurnProbability;
    }

    public Integer getYear() { return year; }
    public Integer getMonth() { return month; }
    public Long getTotalAnalyses() { return totalAnalyses; }
    public Long getHighRiskCount() { return highRiskCount; }
    public Double getAverageChurnProbability() { return averageChurnProbability; }
}
