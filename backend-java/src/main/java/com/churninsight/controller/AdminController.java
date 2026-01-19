package com.churninsight.controller;

import com.churninsight.model.AnalystSummary;
import com.churninsight.model.AnalystPeriodReport;
import com.churninsight.model.PredictionHistory;
import com.churninsight.model.PredictionHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AdminController {

    private final PredictionHistoryRepository historyRepository;

    public AdminController(PredictionHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    // Resumen por analista para panel de ADMIN
    @GetMapping("/analysts")
    public ResponseEntity<List<AnalystSummary>> getAnalystSummaries(Authentication auth) {
        // Spring Security ya protege /api/admin/**, aquí solo devolvemos datos
        List<AnalystSummary> summaries = historyRepository.getAnalystSummaries();
        return ResponseEntity.ok(summaries);
    }

    // Historial por analista con paginación
    @GetMapping("/history/by-analyst")
    public ResponseEntity<Page<PredictionHistory>> getHistoryByAnalyst(
            @RequestParam String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PredictionHistory> result = historyRepository.findByUsernameOrderByPredictionDateDesc(username, pageable);
        return ResponseEntity.ok(result);
    }

    // Historial por analista filtrado por rango de fechas
    @GetMapping("/history/by-analyst-range")
    public ResponseEntity<Page<PredictionHistory>> getHistoryByAnalystRange(
            @RequestParam String username,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        try {
            LocalDate startDate = LocalDate.parse(from);
            LocalDate endDate = LocalDate.parse(to);
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusSeconds(1); // inclusive
            Page<PredictionHistory> result = historyRepository
                    .findByUsernameAndPredictionDateBetweenOrderByPredictionDateDesc(
                            username, start, end, pageable);
            return ResponseEntity.ok(result);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Reporte por analista y periodo (monthly/yearly)
    @GetMapping("/report/analyst-period")
    public ResponseEntity<List<AnalystPeriodReport>> getAnalystPeriodReport(
            @RequestParam String username,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "monthly") String granularity) {
        try {
            LocalDate startDate = LocalDate.parse(from);
            LocalDate endDate = LocalDate.parse(to);
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusSeconds(1);

            List<AnalystPeriodReport> result;
            if ("yearly".equalsIgnoreCase(granularity)) {
                result = historyRepository.getAnalystYearlyReport(username, start, end);
            } else {
                result = historyRepository.getAnalystMonthlyReport(username, start, end);
            }
            return ResponseEntity.ok(result);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
