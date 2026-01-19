package com.churninsight.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {
    List<PredictionHistory> findByUsernameOrderByPredictionDateDesc(String username);
    List<PredictionHistory> findTop10ByOrderByPredictionDateDesc();
    long countByUsername(String username);
    long countByUsernameAndPredictionDateBetween(String username, LocalDateTime start, LocalDateTime end);
    long countByUsernameAndChurnProbabilityLessThan(String username, double threshold);
    
    // Nuevos métodos - Fase 3
    List<PredictionHistory> findByCustomerIdOrderByPredictionDateDesc(String customerId);
    List<PredictionHistory> findByCustomerIdAndPredictionDateAfterOrderByPredictionDateDesc(
        String customerId, LocalDateTime since);
    List<PredictionHistory> findByPredictionDateAfter(LocalDateTime since);
    
    // Método para historial completo del sistema (con paginación)
    org.springframework.data.domain.Page<PredictionHistory> findAllByOrderByPredictionDateDesc(
        org.springframework.data.domain.Pageable pageable);

    // Historial por analista con paginación
    org.springframework.data.domain.Page<PredictionHistory> findByUsernameOrderByPredictionDateDesc(
        String username, org.springframework.data.domain.Pageable pageable);

    // Historial por analista y rango de fechas con paginación
    org.springframework.data.domain.Page<PredictionHistory> findByUsernameAndPredictionDateBetweenOrderByPredictionDateDesc(
        String username,
        java.time.LocalDateTime start,
        java.time.LocalDateTime end,
        org.springframework.data.domain.Pageable pageable);
    
    // Métodos optimizados para KPIs (sin cargar entidades completas)
    long countByChurnProbabilityGreaterThan(double threshold);
    
    @Query("SELECT SUM(p.balance) FROM PredictionHistory p WHERE p.churnProbability > :threshold")
    Double sumBalanceByChurnProbabilityGreaterThan(double threshold);
    
    @Query("SELECT AVG(p.churnProbability) FROM PredictionHistory p")
    Double averageChurnProbability();

    // Resumen por analista (username), uniendo con tabla users para obtener fullName
    @Query("SELECT new com.churninsight.model.AnalystSummary(u.username, u.fullName, u.email, COUNT(p), MAX(p.predictionDate), AVG(p.churnProbability)) " +
           "FROM PredictionHistory p JOIN User u ON u.username = p.username " +
           "GROUP BY u.username, u.fullName " +
           "ORDER BY MAX(p.predictionDate) DESC")
    List<AnalystSummary> getAnalystSummaries();

        // Reporte por analista y periodo (mensual): año, mes, total, alto riesgo, promedio
        @Query("SELECT new com.churninsight.model.AnalystPeriodReport( " +
            "YEAR(p.predictionDate), MONTH(p.predictionDate), " +
            "COUNT(p), SUM(CASE WHEN p.churnProbability > 0.75 THEN 1 ELSE 0 END), AVG(p.churnProbability)) " +
            "FROM PredictionHistory p " +
            "WHERE p.username = :username AND p.predictionDate BETWEEN :start AND :end " +
            "GROUP BY YEAR(p.predictionDate), MONTH(p.predictionDate) " +
            "ORDER BY YEAR(p.predictionDate), MONTH(p.predictionDate)")
        List<AnalystPeriodReport> getAnalystMonthlyReport(String username, java.time.LocalDateTime start, java.time.LocalDateTime end);

        // Reporte anual por analista: año, total, alto riesgo, promedio
        @Query("SELECT new com.churninsight.model.AnalystPeriodReport( " +
            "YEAR(p.predictionDate), NULL, " +
            "COUNT(p), SUM(CASE WHEN p.churnProbability > 0.75 THEN 1 ELSE 0 END), AVG(p.churnProbability)) " +
            "FROM PredictionHistory p " +
            "WHERE p.username = :username AND p.predictionDate BETWEEN :start AND :end " +
            "GROUP BY YEAR(p.predictionDate) " +
            "ORDER BY YEAR(p.predictionDate)")
        List<AnalystPeriodReport> getAnalystYearlyReport(String username, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
