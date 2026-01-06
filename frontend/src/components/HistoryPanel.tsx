import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { PersonOutline, TrendingUp, TrendingDown } from "@mui/icons-material";
import { fetchHistory, PredictionHistory } from "../services/api";

const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability > 0.7) return "error";
    if (probability > 0.4) return "warning";
    return "success";
  };

  const getRiskLabel = (probability: number) => {
    if (probability > 0.7) return "Alto Riesgo";
    if (probability > 0.4) return "Riesgo Moderado";
    return "Bajo Riesgo";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background:
              "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Historial de Predicciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Últimas predicciones de riesgo de abandono bancario
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : history.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#f8f9fa",
          }}
        >
          <PersonOutline
            sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
            aria-hidden="true"
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay predicciones previas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Las predicciones realizadas aparecerán aquí
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 3, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#1e3c72" }}>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  ID Cliente
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Productos
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: 700 }}
                  align="center"
                >
                  Riesgo por Edad
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: 700 }}
                  align="center"
                >
                  Riesgo Total
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: 700 }}
                  align="center"
                >
                  Probabilidad
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Fecha de Predicción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item, index) => (
                <TableRow
                  key={item.id}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "#f8f9fa" },
                    "&:hover": { bgcolor: "#e9ecef" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutline
                        sx={{ color: "#1e3c72" }}
                        aria-hidden="true"
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {item.customerId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.numOfProducts} productos
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={
                        item.ageRisk === 1 ? "Edad de Riesgo" : "Edad Normal"
                      }
                      color={item.ageRisk === 1 ? "warning" : "default"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getRiskLabel(item.churnProbability)}
                      color={getRiskColor(item.churnProbability)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip
                      title={`${(item.churnProbability * 100).toFixed(
                        1
                      )}% de probabilidad de abandono`}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        {item.churnProbability > 0.5 ? (
                          <TrendingUp
                            sx={{ color: "error.main", fontSize: 20 }}
                            aria-hidden="true"
                          />
                        ) : (
                          <TrendingDown
                            sx={{ color: "success.main", fontSize: 20 }}
                            aria-hidden="true"
                          />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={
                            item.churnProbability > 0.7
                              ? "error.main"
                              : item.churnProbability > 0.4
                              ? "warning.main"
                              : "success.main"
                          }
                        >
                          {(item.churnProbability * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.predictionDate)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {history.length > 0 && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Mostrando {history.length} predicciones más recientes
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HistoryPanel;
