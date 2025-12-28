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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import {
  PersonOutline,
  TrendingUp,
  TrendingDown,
  CalendarMonth,
  AttachMoney,
} from "@mui/icons-material";
import { fetchHistory, PredictionHistory } from "../services/api";

const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"date" | "income">("date");

  useEffect(() => {
    loadHistory();
  }, [sortBy]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory(sortBy, 50);
      setHistory(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (
    event: React.MouseEvent<HTMLElement>,
    newSort: "date" | "income" | null
  ) => {
    if (newSort !== null) {
      setSortBy(newSort);
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

  const getIncomeIcon = (incomeLevel: string) => {
    const level = incomeLevel?.toLowerCase() || "";
    if (level.includes("high") || level.includes("alto")) return "💎";
    if (level.includes("medium") || level.includes("medio")) return "💰";
    return "💵";
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
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
            Historial de Análisis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Usuarios analizados con sus niveles de riesgo y perfil financiero
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={handleSortChange}
          aria-label="ordenar por"
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              borderColor: "#1e3c72",
              color: "#1e3c72",
              "&.Mui-selected": {
                bgcolor: "#1e3c72",
                color: "white",
                "&:hover": {
                  bgcolor: "#2a5298",
                },
              },
            },
          }}
        >
          <ToggleButton value="date">
            <CalendarMonth sx={{ mr: 1, fontSize: 20 }} />
            Por Fecha
          </ToggleButton>
          <ToggleButton value="income">
            <AttachMoney sx={{ mr: 1, fontSize: 20 }} />
            Por Ingresos
          </ToggleButton>
        </ToggleButtonGroup>
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
          <PersonOutline sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay análisis previos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Los usuarios analizados aparecerán aquí
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
                  ID Usuario
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Edad
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Nivel de Ingresos
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: 700 }}
                  align="center"
                >
                  Riesgo
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: 700 }}
                  align="center"
                >
                  Probabilidad
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Fecha de Análisis
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
                      <PersonOutline sx={{ color: "#1e3c72" }} />
                      <Typography variant="body2" fontWeight={600}>
                        {item.customerId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.age} años</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {getIncomeIcon(item.incomeLevel)}
                      </span>
                      <Typography variant="body2" fontWeight={500}>
                        {item.incomeLevel}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getRiskLabel(item.probability)}
                      color={getRiskColor(item.probability)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip
                      title={`${(item.probability * 100).toFixed(
                        1
                      )}% de probabilidad de inactividad`}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        {item.probability > 0.5 ? (
                          <TrendingUp
                            sx={{ color: "error.main", fontSize: 20 }}
                          />
                        ) : (
                          <TrendingDown
                            sx={{ color: "success.main", fontSize: 20 }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={
                            item.probability > 0.7
                              ? "error.main"
                              : item.probability > 0.4
                              ? "warning.main"
                              : "success.main"
                          }
                        >
                          {(item.probability * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.createdAt)}
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
            Mostrando {history.length} análisis más recientes
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HistoryPanel;
