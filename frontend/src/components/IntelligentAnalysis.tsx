import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ExpandMore,
  Psychology,
  TrendingUp,
  Warning,
  CheckCircle,
  Lightbulb,
  Flag,
  Timeline,
  LocalOffer,
  Speed,
  Category,
} from "@mui/icons-material";
import { ChurnPredictionResponse } from "../types";

interface IntelligentAnalysisProps {
  prediction: ChurnPredictionResponse;
  formData?: any; // Datos originales del formulario
}

interface RiskFactor {
  name: string;
  value: number;
  impact: "critical" | "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

interface Segment {
  name: string;
  characteristics: string[];
  retention_strategy: string;
}

const IntelligentAnalysis: React.FC<IntelligentAnalysisProps> = ({
  prediction,
  formData,
}) => {
  const probability = prediction.churn_probability || 0;

  // 1. ANÁLISIS DE FACTORES DE RIESGO PRINCIPALES
  const riskFactors = useMemo((): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // Analizar edad (Age_Risk)
    if (formData?.age >= 40 && formData?.age <= 70) {
      factors.push({
        name: "Edad de Riesgo (40-70 años)",
        value: 0.85,
        impact: "high",
        description: "Cliente en rango etario con mayor propensión al abandono",
        recommendation:
          "Crear contenido y ofertas específicas para este grupo demográfico",
      });
    }

    // Analizar productos (Products_Risk_Flag)
    if (formData?.numOfProducts >= 3) {
      factors.push({
        name: "Múltiples Productos (3+)",
        value: 0.75,
        impact: "high",
        description:
          "Sobrecarga de productos puede generar confusión y abandono",
        recommendation:
          "Simplificar portafolio, consolidar servicios, ofrecer asesoría personalizada",
      });
    }

    // Analizar inactividad (Inactivo_40_70)
    if (
      formData?.isActiveMember === 0 &&
      formData?.age >= 40 &&
      formData?.age <= 70
    ) {
      factors.push({
        name: "Inactivo en Edad Crítica",
        value: 0.95,
        impact: "critical",
        description:
          "Combinación peligrosa: inactividad en rango etario de alto riesgo",
        recommendation:
          "URGENTE: Campaña de reactivación inmediata con incentivos atractivos",
      });
    }

    // Analizar país (Country_Risk_Flag)
    if (formData?.country === "Germany") {
      factors.push({
        name: "País de Alto Riesgo (Alemania)",
        value: 0.7,
        impact: "medium",
        description:
          "Mercado alemán muestra tasas de churn históricamente elevadas",
        recommendation:
          "Investigar competencia local, adaptar ofertas al mercado alemán",
      });
    }

    // Analizar cambios en balance (Delta_Balance)
    if (formData?.deltaBalance < -1000) {
      factors.push({
        name: "Retiro Significativo de Fondos",
        value: 0.9,
        impact: "critical",
        description: `Cliente retiró ${Math.abs(formData.deltaBalance).toLocaleString()}$ recientemente`,
        recommendation:
          "Contacto inmediato para entender razones y ofrecer alternativas",
      });
    } else if (formData?.deltaBalance < 0) {
      factors.push({
        name: "Reducción de Balance",
        value: 0.6,
        impact: "medium",
        description: "Cliente está reduciendo su exposición con la empresa",
        recommendation: "Ofrecer productos de inversión o ahorro atractivos",
      });
    }

    // Analizar cancelación de productos (Delta_NumOfProducts)
    if (formData?.deltaNumOfProducts < 0) {
      factors.push({
        name: "Cancelación de Productos",
        value: 0.8,
        impact: "high",
        description: `Cliente canceló ${Math.abs(formData.deltaNumOfProducts)} producto(s)`,
        recommendation:
          "Investigar motivos de cancelación, ofrecer alternativas mejoradas",
      });
    }

    // Analizar transición a inactividad (Recent_Inactive)
    if (formData?.recentInactive) {
      factors.push({
        name: "Pasó de Activo a Inactivo",
        value: 0.85,
        impact: "critical",
        description: "Cliente dejó de utilizar activamente los servicios",
        recommendation:
          "Campaña de win-back urgente, identificar barreras de uso",
      });
    }

    // Analizar caída en uso de productos (Product_Usage_Drop)
    if (formData?.productUsageDrop) {
      factors.push({
        name: "Disminución en Uso de Productos",
        value: 0.75,
        impact: "high",
        description: "Cliente redujo significativamente su engagement",
        recommendation:
          "Gamificación, rewards por uso, notificaciones de valor agregado",
      });
    }

    // Analizar quejas (Had_Complaint)
    if (formData?.hadComplaint) {
      factors.push({
        name: "Quejas Recientes",
        value: 0.8,
        impact: "high",
        description: "Cliente expresó insatisfacción recientemente",
        recommendation:
          "Seguimiento de resolución, compensación proactiva, mejorar CX",
      });
    }

    return factors.sort((a, b) => b.value - a.value);
  }, [formData]);

  // 2. SEGMENTACIÓN INTELIGENTE DEL CLIENTE
  const customerSegment = useMemo((): Segment => {
    const age = formData?.age || 0;
    const products = formData?.numOfProducts || 0;
    const active = formData?.isActiveMember === 1;
    const balance = formData?.balance || 0;
    const salary = formData?.estimatedSalary || 0;

    // Segmento Premium
    if (balance > 100000 || salary > 150000) {
      return {
        name: "Cliente Premium / VIP",
        characteristics: [
          "Alto valor económico",
          "Poder adquisitivo significativo",
          "Requiere atención personalizada",
          "Sensible a la calidad del servicio",
        ],
        retention_strategy:
          "Asignar gerente de cuenta dedicado, servicios exclusivos, beneficios premium",
      };
    }

    // Segmento en Riesgo Múltiple
    if (
      !active &&
      (formData?.deltaBalance < 0 || formData?.deltaNumOfProducts < 0)
    ) {
      return {
        name: "En Riesgo Crítico Multifactor",
        characteristics: [
          "Inactivo con señales de abandono",
          "Reduciendo su relación comercial",
          "Múltiples indicadores negativos",
          "Requiere intervención urgente",
        ],
        retention_strategy:
          "Equipo de retención especializado, ofertas agresivas, contacto inmediato",
      };
    }

    // Segmento Joven Activo
    if (age < 35 && active && products <= 2) {
      return {
        name: "Millennial/Gen Z Activo",
        characteristics: [
          "Edad joven con potencial de crecimiento",
          "Activo pero con pocos productos",
          "Oportunidad de cross-selling",
          "Sensible a experiencia digital",
        ],
        retention_strategy:
          "Gamificación, app móvil optimizada, beneficios por referidos",
      };
    }

    // Segmento Senior Conservador
    if (age > 55 && products >= 2 && active) {
      return {
        name: "Cliente Senior Establecido",
        characteristics: [
          "Cliente maduro y estable",
          "Múltiples productos activos",
          "Valora seguridad y confianza",
          "Requiere comunicación clara",
        ],
        retention_strategy:
          "Asesoría financiera, productos de inversión conservadores, atención telefónica",
      };
    }

    // Segmento Estándar
    return {
      name: "Cliente Estándar",
      characteristics: [
        "Perfil balanceado",
        "Uso moderado de servicios",
        "Potencial de desarrollo",
        "Requiere engagement regular",
      ],
      retention_strategy:
        "Comunicación periódica, ofertas personalizadas, programas de fidelización",
    };
  }, [formData]);

  // 3. SCORE DE URGENCIA
  const urgencyScore = useMemo(() => {
    let score = 0;
    let factors = [];

    if (probability > 0.8) {
      score += 40;
      factors.push("Probabilidad muy alta");
    }
    if (formData?.recentInactive) {
      score += 20;
      factors.push("Recientemente inactivo");
    }
    if (formData?.deltaBalance < -1000) {
      score += 15;
      factors.push("Retiro masivo de fondos");
    }
    if (formData?.hadComplaint) {
      score += 15;
      factors.push("Queja reciente");
    }
    if (formData?.deltaNumOfProducts < 0) {
      score += 10;
      factors.push("Cancelación de productos");
    }

    return { score: Math.min(100, score), factors };
  }, [probability, formData]);

  // 4. VALOR DEL CLIENTE (CLV Estimado)
  const customerValue = useMemo(() => {
    const balance = formData?.balance || 0;
    const salary = formData?.estimatedSalary || 0;
    const products = formData?.numOfProducts || 1;
    const tenure = formData?.tenure || 0;

    // Fórmula simplificada de CLV
    const estimatedCLV =
      (balance * 0.03 + salary * 0.05) * products * (tenure / 12);

    return {
      clv: estimatedCLV,
      potential_loss: estimatedCLV * probability,
      retention_roi: estimatedCLV * probability * 0.8, // 80% del valor puede salvarse
    };
  }, [formData, probability]);

  // 5. TIMELINE DE ACCIÓN RECOMENDADO
  const actionTimeline = useMemo(() => {
    if (urgencyScore.score > 70) {
      return {
        immediateActions: [
          "Contacto telefónico en próximas 2 horas",
          "Oferta exclusiva de retención (descuento 30%)",
          "Escalamiento a gerente senior",
        ],
        shortTerm: [
          "Seguimiento día 3: verificar satisfacción",
          "Día 7: segunda oferta si no hay respuesta",
          "Día 14: revisión final antes de marcar como perdido",
        ],
        mediumTerm: [],
      };
    } else if (urgencyScore.score > 40) {
      return {
        immediateActions: [
          "Email personalizado en próximas 24 horas",
          "Oferta de mejora de servicio",
        ],
        shortTerm: [
          "Semana 1: Encuesta de satisfacción",
          "Semana 2: Oferta de producto complementario",
          "Mes 1: Revisión de progreso",
        ],
        mediumTerm: [
          "Trimestre: Evaluación de retención",
          "Semestre: Programa de fidelización",
        ],
      };
    } else {
      return {
        immediateActions: ["Mantener comunicación regular"],
        shortTerm: [
          "Mes 1: Check-in de satisfacción",
          "Trimestre: Oferta de beneficios por lealtad",
        ],
        mediumTerm: [
          "Semestre: Invitación a programa de referidos",
          "Anual: Revisión de beneficios premium",
        ],
      };
    }
  }, [urgencyScore]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "success";
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        <Psychology sx={{ mr: 1, verticalAlign: "middle" }} />
        Análisis Inteligente Basado en IA
      </Typography>

      {/* Score de Urgencia */}
      <Alert
        severity={
          urgencyScore.score > 70
            ? "error"
            : urgencyScore.score > 40
              ? "warning"
              : "success"
        }
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            <Speed sx={{ mr: 1, verticalAlign: "middle" }} />
            Score de Urgencia: {urgencyScore.score}/100
          </Typography>
          <Typography variant="body2">
            Factores detectados: {urgencyScore.factors.join(", ")}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={urgencyScore.score}
            color={
              urgencyScore.score > 70
                ? "error"
                : urgencyScore.score > 40
                  ? "warning"
                  : "success"
            }
            sx={{ mt: 2, height: 8, borderRadius: 4 }}
          />
        </Box>
      </Alert>

      {/* Valor del Cliente */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "#f5f5f5" }}>
        <Typography variant="h6" gutterBottom>
          <LocalOffer sx={{ mr: 1, verticalAlign: "middle" }} />
          Valor del Cliente (CLV)
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ flex: "1 1 300px", textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Valor Estimado
            </Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              $
              {customerValue.clv.toLocaleString("es-ES", {
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Box>
          <Box sx={{ flex: "1 1 300px", textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Pérdida Potencial
            </Typography>
            <Typography variant="h5" color="error" sx={{ fontWeight: 700 }}>
              $
              {customerValue.potential_loss.toLocaleString("es-ES", {
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Box>
          <Box sx={{ flex: "1 1 300px", textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              ROI de Retención
            </Typography>
            <Typography
              variant="h5"
              color="success.main"
              sx={{ fontWeight: 700 }}
            >
              $
              {customerValue.retention_roi.toLocaleString("es-ES", {
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Factores de Riesgo */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            <Warning sx={{ mr: 1, verticalAlign: "middle" }} />
            Factores de Riesgo Detectados ({riskFactors.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {riskFactors.map((factor, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemIcon>
                    <Chip
                      label={`${(factor.value * 100).toFixed(0)}%`}
                      color={getImpactColor(factor.impact)}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {factor.name}
                        </Typography>
                        <Chip
                          label={factor.impact.toUpperCase()}
                          size="small"
                          color={getImpactColor(factor.impact)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {factor.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: "primary.main", fontWeight: 500 }}
                        >
                          💡 {factor.recommendation}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < riskFactors.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {riskFactors.length === 0 && (
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="No se detectaron factores de riesgo significativos"
                  secondary="Cliente muestra un perfil estable y saludable"
                />
              </ListItem>
            )}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Segmentación */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            <Category sx={{ mr: 1, verticalAlign: "middle" }} />
            Segmentación del Cliente
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={customerSegment.name}
                  color="primary"
                  sx={{ fontSize: "1rem", fontWeight: "bold", mb: 2 }}
                />
              </Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Características:
              </Typography>
              <List dense>
                {customerSegment.characteristics.map((char, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Flag color="action" />
                    </ListItemIcon>
                    <ListItemText primary={char} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Estrategia de Retención:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {customerSegment.retention_strategy}
              </Typography>
            </CardContent>
          </Card>
        </AccordionDetails>
      </Accordion>

      {/* Timeline de Acción */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">
            <Timeline sx={{ mr: 1, verticalAlign: "middle" }} />
            Plan de Acción Temporal
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {actionTimeline.immediateActions.length > 0 && (
              <Box sx={{ flex: "1 1 300px" }}>
                <Paper sx={{ p: 2, bgcolor: "#ffebee" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "error.main", mb: 2 }}
                  >
                    🔴 INMEDIATO (0-24h)
                  </Typography>
                  <List dense>
                    {actionTimeline.immediateActions.map((action, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TrendingUp color="error" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
            {actionTimeline.shortTerm.length > 0 && (
              <Box sx={{ flex: "1 1 300px" }}>
                <Paper sx={{ p: 2, bgcolor: "#fff3e0" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "warning.main", mb: 2 }}
                  >
                    🟡 CORTO PLAZO (1-4 semanas)
                  </Typography>
                  <List dense>
                    {actionTimeline.shortTerm.map((action, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Lightbulb color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
            {actionTimeline.mediumTerm.length > 0 && (
              <Box sx={{ flex: "1 1 300px" }}>
                <Paper sx={{ p: 2, bgcolor: "#e8f5e9" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "success.main", mb: 2 }}
                  >
                    🟢 MEDIANO PLAZO (1-6 meses)
                  </Typography>
                  <List dense>
                    {actionTimeline.mediumTerm.map((action, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default IntelligentAnalysis;
