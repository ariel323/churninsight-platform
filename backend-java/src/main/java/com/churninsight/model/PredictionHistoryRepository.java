package com.churninsight.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {
    List<PredictionHistory> findByUsernameOrderByPredictionDateDesc(String username);
    List<PredictionHistory> findTop10ByOrderByPredictionDateDesc();
    List<PredictionHistory> findTop50ByUsernameOrderByPredictionDateDesc(String username);
    long countByUsername(String username);
    long countByUsernameAndPredictionDateBetween(String username, LocalDateTime start, LocalDateTime end);
    long countByUsernameAndChurnProbabilityLessThan(String username, double threshold);
    
    // Nuevos métodos - Fase 3
    List<PredictionHistory> findByCustomerIdOrderByPredictionDateDesc(String customerId);
    List<PredictionHistory> findByCustomerIdAndPredictionDateAfterOrderByPredictionDateDesc(
        String customerId, LocalDateTime since);
    List<PredictionHistory> findByPredictionDateAfter(LocalDateTime since);
}
