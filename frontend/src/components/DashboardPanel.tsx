import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { ChurnPredictionResponse } from "../types";

interface DashboardPanelProps {
  prediction: ChurnPredictionResponse;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ prediction }) => {
  // Detectar si hay un error en la predicción
  const hasError =
    prediction.prevision &&
    (prediction.prevision.includes("Error") ||
      prediction.prevision.includes("error"));

  if (hasError) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 4,
          bgcolor: "error.light",
          color: "error.contrastText",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h5" gutterBottom>
          ⚠️ Error en la Predicción
        </Typography>
        <Typography variant="body1">{prediction.prevision}</Typography>
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
          Por favor, reintente la predicción o contacte al administrador del
          sistema.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: "text.primary",
        }}
      >
        Panel Estratégico de Retención
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Métricas en tiempo real y recomendaciones de IA para maximizar la
        retención de usuarios en su billetera digital
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 3,
        }}
      >
        {/* Tarjeta de Resumen */}
        <Box sx={{ gridColumn: { xs: "1", md: "1 / -1" } }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              background:
                "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)",
              color: "white",
              borderRadius: 2,
              borderTop: "4px solid #fbbf24",
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              📊 Resumen Ejecutivo
            </Typography>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ID de Usuario
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {prediction.customer_id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Riesgo de Inactividad
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {(prediction.churn_probability * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Clasificación de Riesgo
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {prediction.prevision}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Métricas Clave */}
        <Box>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary">
              🎯 Acción Recomendada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {prediction.churn_probability > 0.7
                ? "Contacto inmediato con el usuario. Ofrecer cashback especial, beneficios premium y descuentos en transacciones."
                : prediction.churn_probability > 0.4
                ? "Activar campaña de engagement. Enviar promociones personalizadas y ofertas exclusivas en la wallet."
                : "Mantener experiencia de usuario actual. Continuar monitoreando actividad y satisfacción en la plataforma."}
            </Typography>
          </Paper>
        </Box>

        <Box>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="primary">
              ⏱️ Tiempo de Acción
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {prediction.churn_probability > 0.7
                ? "URGENTE: Actuar en las próximas 24-48 horas"
                : prediction.churn_probability > 0.4
                ? "Moderado: Actuar dentro de 7 días"
                : "Normal: Monitoreo continuo mensual"}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPanel;
