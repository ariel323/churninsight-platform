import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Close, TrendingUp, Warning, CheckCircle } from "@mui/icons-material";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  PredictionHistory,
  HistoricalPrediction,
  fetchCustomerHistory,
} from "../services/api";

interface BusinessInsight {
  causalTecnica: string;
  causalNegocio: string;
  accionSugerida: string;
  prioridad: "alta" | "media" | "baja";
  impactoEstimado: string;
}

interface CustomerRiskProfileProps {
  open: boolean;
  onClose: () => void;
  customer: PredictionHistory;
  getBusinessInsight: (item: PredictionHistory) => BusinessInsight;
}

const CustomerRiskProfile: React.FC<CustomerRiskProfileProps> = ({
  open,
  onClose,
  customer,
  getBusinessInsight,
}) => {
  const [historicalData, setHistoricalData] = useState<HistoricalPrediction[]>(
    []
  );
  const [loadingHistory, setLoadingHistory] = useState(false);
  const insight = getBusinessInsight(customer);

  const loadCustomerHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchCustomerHistory(customer.customerId, 90);
      setHistoricalData(data);
    } catch (error) {
      console.error("Error cargando historial del cliente:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [customer.customerId]);

  useEffect(() => {
    if (open && customer) {
      loadCustomerHistory();
    }
  }, [open, customer, loadCustomerHistory]);

  // Datos para el Gráfico de Radar
  const radarData = [
    {
      metric: "Actividad",
      value: customer.isActiveMember ? 100 : 0,
      fullMark: 100,
    },
    {
      metric: "Productos",
      value: Math.max(0, 100 - (customer.numOfProducts / 10) * 100), // Invertido: menos productos = mejor
      fullMark: 100,
    },
    {
      metric: "Estabilidad",
      value: customer.ageRisk === 1 ? 50 : 100, // Edad en rango de riesgo reduce estabilidad
      fullMark: 100,
    },
    {
      metric: "País",
      value: customer.countryRiskFlag === 1 ? 40 : 100,
      fullMark: 100,
    },
    {
      metric: "Lealtad",
      value: (1 - customer.churnProbability) * 100,
      fullMark: 100,
    },
  ];

  const getRiskColor = () => {
    if (customer.churnProbability > 0.75) return "#d32f2f";
    if (customer.churnProbability > 0.4) return "#ed6c02";
    return "#2e7d32";
  };

  const getRiskIcon = () => {
    if (customer.churnProbability > 0.75)
      return <Warning sx={{ fontSize: 40, color: "#d32f2f" }} />;
    if (customer.churnProbability > 0.4)
      return <TrendingUp sx={{ fontSize: 40, color: "#ed6c02" }} />;
    return <CheckCircle sx={{ fontSize: 40, color: "#2e7d32" }} />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" fontWeight={700}>
              Perfil de Riesgo
            </Typography>
            <Chip
              label={customer.customerId}
              color="primary"
              variant="outlined"
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Tarjeta de Riesgo Principal */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: `${getRiskColor()}10`,
            borderLeft: `4px solid ${getRiskColor()}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 2 }}>{getRiskIcon()}</Grid>
            <Grid size={{ xs: 10 }}>
              <Typography variant="h3" fontWeight={700} color={getRiskColor()}>
                {(customer.churnProbability * 100).toFixed(1)}%
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Probabilidad de Abandono
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.churnProbability > 0.75
                  ? "⚠️ Cliente en riesgo crítico - Acción inmediata requerida"
                  : customer.churnProbability > 0.4
                  ? "⚡ Riesgo moderado - Monitoreo activo recomendado"
                  : "✅ Cliente estable - Mantenimiento preventivo"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Gráfico de Radar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📊 Perfil del Cliente
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Métricas de estabilidad y retención
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Puntuación"
                    dataKey="value"
                    stroke={getRiskColor()}
                    fill={getRiskColor()}
                    fillOpacity={0.6}
                  />
                  <RechartsTooltip
                    formatter={(value: number | undefined) => [
                      `${(value || 0).toFixed(0)}`,
                      "Puntuación",
                    ]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Detalles del Cliente */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={1} sx={{ p: 2, height: "100%" }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📋 Detalles del Cliente
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Productos contratados
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {customer.numOfProducts}
                  </Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Miembro activo
                  </Typography>
                  <Chip
                    label={customer.isActiveMember ? "Sí" : "No"}
                    color={customer.isActiveMember ? "success" : "error"}
                    size="small"
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Edad en rango de riesgo
                  </Typography>
                  <Chip
                    label={customer.ageRisk === 1 ? "Sí" : "No"}
                    color={customer.ageRisk === 1 ? "warning" : "default"}
                    size="small"
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Cliente inactivo (40-70 años)
                  </Typography>
                  <Chip
                    label={customer.inactivo4070 === 1 ? "Sí" : "No"}
                    color={customer.inactivo4070 === 1 ? "error" : "success"}
                    size="small"
                  />
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    País de riesgo
                  </Typography>
                  <Chip
                    label={customer.countryRiskFlag === 1 ? "Sí" : "No"}
                    color={
                      customer.countryRiskFlag === 1 ? "warning" : "default"
                    }
                    size="small"
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recomendación de Negocio */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                bgcolor: "#f5f5f5",
                borderLeft: `4px solid ${
                  insight.prioridad === "alta"
                    ? "#d32f2f"
                    : insight.prioridad === "media"
                    ? "#ed6c02"
                    : "#757575"
                }`,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Typography variant="h6" fontWeight={600}>
                  💡 Recomendación de Negocio
                </Typography>
                <Chip
                  label={`Prioridad ${insight.prioridad.toUpperCase()}`}
                  color={
                    insight.prioridad === "alta"
                      ? "error"
                      : insight.prioridad === "media"
                      ? "warning"
                      : "default"
                  }
                  size="small"
                />
              </Box>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                {insight.causalNegocio}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Causa técnica:</strong> {insight.causalTecnica}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="body1" fontWeight={600} gutterBottom>
                  ✅ Acción Sugerida:
                </Typography>
                <Typography variant="body1" color="primary" gutterBottom>
                  {insight.accionSugerida}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Impacto estimado:</strong> {insight.impactoEstimado}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Gráfico de Evolución Temporal */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                📈 Evolución del Riesgo (Últimos 90 días)
              </Typography>
              {loadingHistory ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : historicalData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#666", fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fill: "#666", fontSize: 11 }}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <RechartsTooltip
                      formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="probability"
                      stroke={getRiskColor()}
                      strokeWidth={3}
                      dot={{ fill: getRiskColor(), r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Probabilidad de Churn"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay datos históricos disponibles para este cliente
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerRiskProfile;
