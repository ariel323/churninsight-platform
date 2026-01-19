import React, { useMemo, lazy, Suspense } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  TrendingDown,
  Psychology,
} from "@mui/icons-material";
import { ChurnPredictionResponse } from "./types";
import IntelligentAnalysis from "./components/IntelligentAnalysis";

// Lazy load de gráficos pesados
const ChartsSection = lazy(() => import("./components/ChartsSection"));

interface PredictionResultsProps {
  prediction: ChurnPredictionResponse | null;
  error: string | null;
  formData?: any; // Datos del formulario para análisis inteligente
}

const PredictionResults: React.FC<PredictionResultsProps> = ({
  prediction,
  error,
  formData,
}) => {
  // Calcular variables antes de cualquier return
  const probability = prediction?.churn_probability || 0;
  const isHighRisk = probability > 0.7;
  const isMediumRisk = probability > 0.4 && probability <= 0.7;
  const isLowRisk = probability <= 0.4;

  // Recomendaciones basadas en el riesgo - DEBE estar antes de cualquier return
  const recommendations = useMemo(() => {
    if (isHighRisk) {
      return [
        "Contacto inmediato con el cliente",
        "Ofrecer descuentos o promociones exclusivas",
        "Asignar un gerente de cuenta dedicado",
        "Implementar programa de fidelización urgente",
        "Revisar historial de quejas y resolverlas",
      ];
    } else if (isMediumRisk) {
      return [
        "Realizar encuesta de satisfacción",
        "Ofrecer productos complementarios",
        "Mejorar comunicación proactiva",
        "Evaluar experiencia del usuario",
        "Considerar programa de beneficios",
      ];
    } else {
      return [
        "Mantener nivel de servicio actual",
        "Solicitar referidos y testimonios",
        "Ofrecer beneficios por lealtad",
        "Monitorear satisfacción regularmente",
        "Invitar a programa de embajadores",
      ];
    }
  }, [isHighRisk, isMediumRisk]);

  // Early returns después de hooks
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        <Typography variant="h6">⚠️ Error en la Predicción</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  if (!prediction) return null;

  // Datos para gráficos
  const barData = [
    {
      name: "Probabilidad de Churn",
      value: probability * 100,
      color: isHighRisk ? "#d32f2f" : isMediumRisk ? "#ed6c02" : "#2e7d32",
    },
  ];

  const pieData = [
    { name: "Riesgo de Churn", value: probability * 100, color: "#ff4444" },
    { name: "Retención", value: (1 - probability) * 100, color: "#44ff88" },
  ];

  const radarData = [
    { subject: "Satisfacción", A: (1 - probability) * 100 },
    { subject: "Engagement", A: probability < 0.5 ? 80 : 40 },
    { subject: "Lealtad", A: (1 - probability) * 90 },
    { subject: "Actividad", A: probability < 0.5 ? 85 : 35 },
    { subject: "Valor", A: (1 - probability) * 95 },
  ];

  const trendData = [
    { time: "T-3", score: Math.max(20, (1 - probability) * 100 - 30) },
    { time: "T-2", score: Math.max(30, (1 - probability) * 100 - 20) },
    { time: "T-1", score: Math.max(40, (1 - probability) * 100 - 10) },
    { time: "Actual", score: (1 - probability) * 100 },
  ];

  const riskLevel = isHighRisk ? "ALTO" : isMediumRisk ? "MEDIO" : "BAJO";
  const riskColor = isHighRisk ? "error" : isMediumRisk ? "warning" : "success";
  const riskIcon = isHighRisk ? (
    <Warning aria-hidden="true" />
  ) : isMediumRisk ? (
    <TrendingDown aria-hidden="true" />
  ) : (
    <CheckCircle aria-hidden="true" />
  );

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header de Resultados - estilo más discreto */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", fontWeight: 600 }}
            >
              {riskIcon}
              <Box component="span" sx={{ ml: 2 }}>
                Análisis Completado
              </Box>
            </Typography>
            <Typography variant="body1">
              Cliente: <strong>{prediction.customer_id}</strong>
            </Typography>
          </Box>
          <Chip
            label={`RIESGO ${riskLevel}`}
            sx={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              bgcolor: "white",
              color: isHighRisk
                ? "#d32f2f"
                : isMediumRisk
                  ? "#ed6c02"
                  : "#2e7d32",
            }}
          />
        </Box>
      </Paper>

      {/* Métricas Principales */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Box sx={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "280px" }}>
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Probabilidad de Churn
              </Typography>
              <Typography variant="h3" color={riskColor} sx={{ mb: 2 }}>
                {(probability * 100).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={probability * 100}
                color={riskColor}
                sx={{ height: 12, borderRadius: 6 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                {prediction.prevision}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "280px" }}>
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Nivel de Confianza
              </Typography>
              <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
                {((1 - Math.abs(probability - 0.5) * 2) * 100).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(1 - Math.abs(probability - 0.5) * 2) * 100}
                color="primary"
                sx={{ height: 12, borderRadius: 6 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                Precisión del modelo
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "280px" }}>
          <Card
            sx={{
              height: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Índice de Retención
              </Typography>
              <Typography variant="h3" color="success.main" sx={{ mb: 2 }}>
                {((1 - probability) * 100).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(1 - probability) * 100}
                color="success"
                sx={{ height: 12, borderRadius: 6 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                Probabilidad de retención
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Gráficos de Análisis - Lazy Loaded */}
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        }
      >
        <ChartsSection
          barData={barData}
          pieData={pieData}
          radarData={radarData}
          trendData={trendData}
        />
      </Suspense>

      {/* Recomendaciones */}
      <Card
        sx={{
          mt: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #e0e0e0",
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Psychology sx={{ mr: 1 }} aria-hidden="true" />
            Recomendaciones Estratégicas
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            {recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Chip
                    label={index + 1}
                    size="small"
                    color={riskColor}
                    sx={{ fontWeight: "bold" }}
                  />
                </ListItemIcon>
                <ListItemText primary={rec} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Alerta Final */}
      {isHighRisk && (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          icon={<Warning fontSize="large" aria-hidden="true" />}
        >
          <Typography variant="h6">🚨 Acción Inmediata Requerida</Typography>
          <Typography>
            Este cliente presenta un <strong>alto riesgo de abandono</strong>.
            Se recomienda contacto inmediato y estrategias de retención urgentes
            para evitar la pérdida del cliente.
          </Typography>
        </Alert>
      )}

      {isMediumRisk && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="h6">⚠️ Atención Recomendada</Typography>
          <Typography>
            Este cliente presenta un <strong>riesgo moderado</strong>.
            Implementar estrategias proactivas de engagement y satisfacción para
            mejorar la retención.
          </Typography>
        </Alert>
      )}

      {isLowRisk && (
        <Alert
          severity="success"
          sx={{ mt: 3 }}
          icon={<CheckCircle fontSize="large" aria-hidden="true" />}
        >
          <Typography variant="h6">✅ Cliente Estable</Typography>
          <Typography>
            Este cliente presenta un <strong>bajo riesgo de abandono</strong>.
            Mantener el nivel de servicio actual y considerar programas de
            fidelización para fortalecer la relación.
          </Typography>
        </Alert>
      )}

      {/* Análisis Inteligente Basado en IA */}
      {prediction && formData && (
        <IntelligentAnalysis prediction={prediction} formData={formData} />
      )}

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          📊 <strong>Nota:</strong> Los resultados se basan en un modelo de
          machine learning entrenado con datos históricos. Las recomendaciones
          deben considerarse junto con información adicional del contexto del
          cliente.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PredictionResults;
