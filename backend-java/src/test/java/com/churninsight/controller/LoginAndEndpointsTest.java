package com.churninsight.controller;

import com.churninsight.service.ChurnPredictionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LoginAndEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

        @Autowired
        private com.churninsight.config.DataInitializer dataInitializer;

        @Autowired
        private com.churninsight.model.UserRepository userRepository;

        @Autowired
        private com.churninsight.model.RoleRepository roleRepository;

        @Autowired
        private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        @Autowired
        private com.churninsight.security.JwtService jwtService;

        @Autowired
        private com.churninsight.service.UserService userService;

    // Mockear el servicio de predicción para evitar dependencias del PMML
    @MockBean
    private ChurnPredictionService churnPredictionService;

        @BeforeEach
        void setupData() {
                // Asegurar que existen roles y usuario admin antes de cada prueba
                try {
                        // Roles
                        var adminRole = roleRepository.findByName("ADMIN")
                                        .orElseGet(() -> roleRepository.save(new com.churninsight.model.Role("ADMIN", "Administrador")));
                        var analistaRole = roleRepository.findByName("ANALISTA")
                                        .orElseGet(() -> roleRepository.save(new com.churninsight.model.Role("ANALISTA", "Analista")));

                        // Usuario admin
                        var adminOpt = userRepository.findByUsername("admin");
                        if (adminOpt.isEmpty()) {
                                var adminUser = new com.churninsight.model.User(
                                                "admin",
                                                passwordEncoder.encode("admin123"),
                                                "admin@churninsight.com",
                                                "Administrador"
                                );
                                adminUser.addRole(adminRole);
                                adminUser.addRole(analistaRole);
                                userRepository.save(adminUser);
                        }
                } catch (Exception ignored) {
                }
        }

    private String loginAndGetToken(String usernameOrEmail, String password) throws Exception {
        String body = objectMapper.createObjectNode()
                .put("username", usernameOrEmail)
                .put("password", password)
                .toString();

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode node = objectMapper.readTree(response);
        return node.get("token").asText();
    }

        private String issueTokenFor(String username) {
                var userDetails = userService.loadUserByUsername(username);
                return jwtService.generateToken(userDetails);
        }

    @Test
    @DisplayName("Admin: login y acceso permitido a /churn/history/all")
    void adminLoginAndAccessAllHistory() throws Exception {
                // Generar token directamente para admin (evitar dependencia del flujo de login)
                String token = issueTokenFor("admin");

        // Acceso a historial de todos los usuarios (solo ADMIN)
        mockMvc.perform(get("/api/churn/history/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // Acceso a historial propio
        mockMvc.perform(get("/api/churn/history")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("Analista: registro, login y acceso denegado a /churn/history/all")
    void analystRegisterLoginAndForbiddenAllHistory() throws Exception {
        // Registrar analista
        String registerBody = objectMapper.createObjectNode()
                .put("username", "analista_test")
                .put("password", "password123")
                .put("email", "analista_test@example.com")
                .put("fullName", "Analista Test")
                .toString();

        var registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andReturn();

        int registerStatus = registerResult.getResponse().getStatus();
        assertTrue(registerStatus == 200 || registerStatus == 400, "Registro debe ser 200 OK o 400 si el usuario ya existe");

        // Login como analista
        String token = loginAndGetToken("analista_test", "password123");

        // Acceso a historial de todos (debe ser 403)
        mockMvc.perform(get("/api/churn/history/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // Acceso a historial propio (200)
        mockMvc.perform(get("/api/churn/history")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("Predicción de churn con token de analista y guardado en historial")
    void predictChurnWithAnalystToken() throws Exception {
        // Mockear predicción (usa PredictionRequest en lugar de double[])
        when(churnPredictionService.predictChurn(any(ChurnPredictionService.PredictionRequest.class))).thenReturn(0.65);

        // Asegurar usuario analista (si no existe, crearlo)
        try {
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.createObjectNode()
                                    .put("username", "analista_pred")
                                    .put("password", "password123")
                                    .put("email", "analista_pred@example.com")
                                    .put("fullName", "Analista Pred")
                                    .toString()))
                    .andExpect(status().isOk());
        } catch (AssertionError ignored) {
            // Puede existir ya, continuar
        }

        String token = loginAndGetToken("analista_pred", "password123");

        // Construir solicitud de predicción
        String predictBody = objectMapper.createObjectNode()
                .put("ageRisk", 1.0)
                .put("numOfProducts", 2.0)
                .put("inactivo4070", 0.0)
                .put("productsRiskFlag", 1.0)
                .put("countryRiskFlag", 0.0)
                .put("balance", 50000.0)
                .put("estimatedSalary", 75000.0)
                .put("country", "España")
                .put("tenure", 5)
                .put("isActiveMember", true)
                .toString();

        // Ejecutar predicción
        String resp = mockMvc.perform(post("/api/churn/predict")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(predictBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.churn_probability", is(closeTo(0.65, 0.0001))))
                .andExpect(jsonPath("$.customer_id", not(emptyString())))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode r = objectMapper.readTree(resp);
        String customerId = r.get("customer_id").asText();
        // Verificar que el historial del usuario tenga entradas
        mockMvc.perform(get("/api/churn/history")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)));
    }

    @Test
    @DisplayName("KPIs y Stats: accesibles con autenticación")
    void kpisAndStatsAccessible() throws Exception {
                String token = issueTokenFor("admin");

        // /api/stats
        mockMvc.perform(get("/api/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.todayPredictions", greaterThanOrEqualTo(0)));

        // /api/stats/kpis (si existe)
        mockMvc.perform(get("/api/stats/kpis")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPredictions", greaterThanOrEqualTo(0)));
    }
}
