package com.churninsight.controller;

import com.churninsight.model.PredictionHistory;
import com.churninsight.model.PredictionHistoryRepository;
import com.churninsight.model.User;
import com.churninsight.service.ChurnPredictionService;
import com.churninsight.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/churn")
public class ChurnController {

    private final ChurnPredictionService service;
    private final PredictionHistoryRepository historyRepository;
    private final UserService userService;

    public ChurnController(ChurnPredictionService service, PredictionHistoryRepository historyRepository, UserService userService) {
        this.service = service;
        this.historyRepository = historyRepository;
        this.userService = userService;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }



    @PostMapping("/predict")
    public ChurnPredictionResponse predict(@RequestBody ChurnPredictionRequest request, Authentication authentication) {
       
        // Computar características derivadas
        request.computeDerivedFeatures();
        
        // Crear request para el API de Python
        ChurnPredictionService.PredictionRequest predictionRequest = new ChurnPredictionService.PredictionRequest();
        predictionRequest.setAgeRisk(request.getAgeRisk());
        predictionRequest.setNumOfProducts(request.getNumOfProducts());
        predictionRequest.setInactivo4070(request.getInactivo4070());
        predictionRequest.setProductsRiskFlag(request.getProductsRiskFlag());
        predictionRequest.setCountryRiskFlag(request.getCountryRiskFlag());
        predictionRequest.setDeltaBalance(request.getDeltaBalance());
        predictionRequest.setDeltaNumOfProducts(request.getDeltaNumOfProducts());
        predictionRequest.setRecentInactive(request.getRecentInactive());
        predictionRequest.setProductUsageDrop(request.getProductUsageDrop());
        predictionRequest.setHadComplaint(request.getHadComplaint());
        
        double probability = service.predictChurn(predictionRequest);
        String customerId = "cliente_" + System.currentTimeMillis();  // Generar ID único
        
        // Guardar en historial
        String username = authentication != null ? authentication.getName() : "anonymous";
        PredictionHistory history = new PredictionHistory(
            customerId,
            probability,
            request.getAgeRisk(),
            (int) request.getNumOfProducts(),
            request.getInactivo4070(),
            request.getProductsRiskFlag(),
            request.getCountryRiskFlag(),
            username
        );
        
        // Guardar nuevos campos (Fase 4)
        history.setBalance(request.getBalance());
        history.setEstimatedSalary(request.getEstimatedSalary());
        history.setCountry(request.getCountry());
        history.setTenure(request.getTenure());
        history.setIsActiveMember(request.getIsActiveMember() == 1);
        
        // Guardar nuevos campos dinámicos
        history.setDeltaBalance(request.getDeltaBalance());
        history.setDeltaNumOfProducts(request.getDeltaNumOfProducts());
        history.setRecentInactive(request.getRecentInactive());
        history.setProductUsageDrop(request.getProductUsageDrop());
        history.setHadComplaint(request.getHadComplaint());
        
        System.out.println("=== DEBUG: Guardando isActiveMember = " + history.getIsActiveMember());
        
        historyRepository.save(history);
        
        return new ChurnPredictionResponse(probability, customerId);
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<PredictionHistoryDto>> getHistory(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String username = authentication.getName();
        
        // Verificar que el usuario existe y está activo
        try {
            User user = userService.getUserByUsername(username);
            if (!user.isActive()) {
                return ResponseEntity.status(403).body(null);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);
        }
        
        // Solo mostrar análisis del usuario autenticado (excluir 'system')
        // Los análisis del sistema (migrados) solo se verán en /history/all para ADMIN
        List<PredictionHistory> history = historyRepository.findByUsernameOrderByPredictionDateDesc(username);
        
        List<PredictionHistoryDto> dtos = history.stream()
            .map(h -> new PredictionHistoryDto(
                h.getId(),
                h.getCustomerId(),
                h.getChurnProbability(),
                h.getAgeRisk(),
                h.getNumOfProducts(),
                h.getInactivo4070(),
                h.getProductsRiskFlag(),
                h.getCountryRiskFlag(),
                h.getPredictionDate().toString(),
                h.getBalance(),
                h.getEstimatedSalary(),
                h.getCountry(),
                h.getTenure(),
                h.getIsActiveMember()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/customer/{customerId}/history")
    public ResponseEntity<List<PredictionHistoryDto>> getCustomerHistory(
            @PathVariable String customerId,
            @RequestParam(defaultValue = "30") int days) {
        
        java.time.LocalDateTime since = java.time.LocalDateTime.now().minusDays(days);
        List<PredictionHistory> history = historyRepository
            .findByCustomerIdAndPredictionDateAfterOrderByPredictionDateDesc(customerId, since);
        
        List<PredictionHistoryDto> dtos = history.stream()
            .map(h -> new PredictionHistoryDto(
                h.getId(),
                h.getCustomerId(),
                h.getChurnProbability(),
                h.getAgeRisk(),
                h.getNumOfProducts(),
                h.getInactivo4070(),
                h.getProductsRiskFlag(),
                h.getCountryRiskFlag(),
                h.getPredictionDate().toString(),
                h.getBalance(),
                h.getEstimatedSalary(),
                h.getCountry(),
                h.getTenure(),
                h.getIsActiveMember()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/history/all")
    public ResponseEntity<HistoryPageResponse> getAllHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "1000") int maxSize,
            Authentication authentication) {
        
        if (authentication == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String username = authentication.getName();
        
        // Verificar si el usuario tiene rol ADMIN
        User user = userService.getUserByUsername(username);
        if (!user.isAdmin()) {
            // Log intento de acceso no autorizado
            System.out.println("[SECURITY] Usuario " + username + " (" + user.getPrimaryRole() + ") intentó acceder a /history/all - DENEGADO");
            return ResponseEntity.status(403).body(null);
        }
        
        System.out.println("[SECURITY] Usuario " + username + " (ADMIN) accedió a /history/all - PERMITIDO");
        
        // Limitar el tamaño máximo para evitar sobrecarga
        size = Math.min(size, maxSize);
        
        org.springframework.data.domain.Pageable pageable = 
            org.springframework.data.domain.PageRequest.of(page, size);
        
        org.springframework.data.domain.Page<PredictionHistory> historyPage = 
            historyRepository.findAllByOrderByPredictionDateDesc(pageable);
        
        List<PredictionHistoryDto> dtos = historyPage.getContent().stream()
            .map(h -> new PredictionHistoryDto(
                h.getId(),
                h.getCustomerId(),
                h.getChurnProbability(),
                h.getAgeRisk(),
                h.getNumOfProducts(),
                h.getInactivo4070(),
                h.getProductsRiskFlag(),
                h.getCountryRiskFlag(),
                h.getPredictionDate().toString(),
                h.getBalance(),
                h.getEstimatedSalary(),
                h.getCountry(),
                h.getTenure(),
                h.getIsActiveMember()
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(new HistoryPageResponse(
            dtos,
            historyPage.getTotalElements(),
            historyPage.getTotalPages(),
            page,
            size
        ));
    }
}

// DTO para historial
class PredictionHistoryDto {
    private Long id;
    private String customerId;
    private Double churnProbability;
    private Double ageRisk;
    private Integer numOfProducts;
    private Double inactivo4070;
    private Double productsRiskFlag;
    private Double countryRiskFlag;
    private String predictionDate;
    // Nuevos campos - Fase 3
    private Double balance;
    private Double estimatedSalary;
    private String country;
    private Integer tenure;
    private Boolean isActiveMember;
    
    public PredictionHistoryDto(Long id, String customerId, Double churnProbability, 
                               Double ageRisk, Integer numOfProducts, Double inactivo4070,
                               Double productsRiskFlag, Double countryRiskFlag, String predictionDate) {
        this.id = id;
        this.customerId = customerId;
        this.churnProbability = churnProbability;
        this.ageRisk = ageRisk;
        this.numOfProducts = numOfProducts;
        this.inactivo4070 = inactivo4070;
        this.productsRiskFlag = productsRiskFlag;
        this.countryRiskFlag = countryRiskFlag;
        this.predictionDate = predictionDate;
    }
    
    // Constructor completo con nuevos campos
    public PredictionHistoryDto(Long id, String customerId, Double churnProbability, 
                               Double ageRisk, Integer numOfProducts, Double inactivo4070,
                               Double productsRiskFlag, Double countryRiskFlag, String predictionDate,
                               Double balance, Double estimatedSalary, String country, 
                               Integer tenure, Boolean isActiveMember) {
        this.id = id;
        this.customerId = customerId;
        this.churnProbability = churnProbability;
        this.ageRisk = ageRisk;
        this.numOfProducts = numOfProducts;
        this.inactivo4070 = inactivo4070;
        this.productsRiskFlag = productsRiskFlag;
        this.countryRiskFlag = countryRiskFlag;
        this.predictionDate = predictionDate;
        this.balance = balance;
        this.estimatedSalary = estimatedSalary;
        this.country = country;
        this.tenure = tenure;
        this.isActiveMember = isActiveMember;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getCustomerId() { return customerId; }
    public Double getChurnProbability() { return churnProbability; }
    public Double getAgeRisk() { return ageRisk; }
    public Integer getNumOfProducts() { return numOfProducts; }
    public Double getInactivo4070() { return inactivo4070; }
    public Double getProductsRiskFlag() { return productsRiskFlag; }
    public Double getCountryRiskFlag() { return countryRiskFlag; }
    public String getPredictionDate() { return predictionDate; }
    public Double getBalance() { return balance; }
    public Double getEstimatedSalary() { return estimatedSalary; }
    public String getCountry() { return country; }
    public Integer getTenure() { return tenure; }
    public Boolean getIsActiveMember() { return isActiveMember; }
}

// DTO para respuesta paginada
class HistoryPageResponse {
    private List<PredictionHistoryDto> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    
    public HistoryPageResponse(List<PredictionHistoryDto> content, long totalElements, 
                               int totalPages, int currentPage, int pageSize) {
        this.content = content;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
    }
    
    public List<PredictionHistoryDto> getContent() { return content; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
    public int getCurrentPage() { return currentPage; }
    public int getPageSize() { return pageSize; }
}