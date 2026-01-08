import React, { useState, useEffect, useMemo } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { PersonOutline, Lightbulb, FileDownload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import {
  fetchHistory,
  fetchKPIs,
  PredictionHistory,
  KPIsData,
} from "../services/api";
import CustomerRiskProfile from "./CustomerRiskProfile";

interface BusinessInsight {
  causalTecnica: string;
  causalNegocio: string;
  accionSugerida: string;
  prioridad: "alta" | "media" | "baja";
  impactoEstimado: string;
}

const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [kpis, setKpis] = useState<KPIsData>({
    totalHighRiskClients: 0,
    capitalAtRisk: 0,
    accuracyLastMonth: 0,
    totalPredictions: 0,
    averageRisk: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ riskLevel: "all" });
  const [selectedCustomer, setSelectedCustomer] =
    useState<PredictionHistory | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadHistory();
    loadKPIs();
  }, []);

  // Función para el semáforo de riesgo
  const getRiskSemaphore = (probability: number) => {
    if (probability > 0.75)
      return {
        color: "#d32f2f",
        label: "CRÍTICO",
        icon: "🔴",
        bgColor: "#ffebee",
      };
    if (probability > 0.4)
      return {
        color: "#ed6c02",
        label: "MEDIO",
        icon: "🟡",
        bgColor: "#fff3e0",
      };
    return { color: "#2e7d32", label: "BAJO", icon: "🟢", bgColor: "#e8f5e9" };
  };

  // Función para derivar la causa del riesgo basada en los flags
  const getBusinessInsight = (item: PredictionHistory): BusinessInsight => {
    // Orden de prioridad
    if (item.inactivo4070 === 1) {
      return {
        causalTecnica: "Cliente inactivo (40-70 años)",
        causalNegocio: "Abandono silencioso",
        accionSugerida: "Oferta de cashback o puntos",
        prioridad: "alta",
        impactoEstimado: "Recuperación: 30-40%",
      };
    }

    if (item.productsRiskFlag === 1) {
      return {
        causalTecnica: `Exceso de productos: ${item.numOfProducts} (límite: 3)`,
        causalNegocio: "Saturación de cartera",
        accionSugerida: "Consolidación de deudas",
        prioridad: "alta",
        impactoEstimado: "Retención: 50-60%",
      };
    }

    if (item.countryRiskFlag === 1) {
      return {
        causalTecnica: "País de mayor riesgo (Alemania)",
        causalNegocio: "Sensibilidad regional",
        accionSugerida: "Revisar tasas competitivas",
        prioridad: "media",
        impactoEstimado: "Ajuste de pricing",
      };
    }

    if (item.ageRisk === 1) {
      return {
        causalTecnica: "Edad en rango de riesgo (40-70)",
        causalNegocio: "Ciclo de vida",
        accionSugerida: "Productos de inversión",
        prioridad: "baja",
        impactoEstimado: "Cross-sell: 20-30%",
      };
    }

    return {
      causalTecnica: "Sin causa de riesgo identificada",
      causalNegocio: "Cliente estable",
      accionSugerida: "Mantener servicio actual",
      prioridad: "baja",
      impactoEstimado: "Monitoreo preventivo",
    };
  };

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

  const loadKPIs = async () => {
    try {
      const data = await fetchKPIs();
      setKpis(data);
    } catch (error) {
      console.error("Error cargando KPIs:", error);
    }
  };

  // Filtrar historial
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filters.riskLevel === "critical" && item.churnProbability <= 0.75)
        return false;
      if (
        filters.riskLevel === "medium" &&
        (item.churnProbability <= 0.4 || item.churnProbability > 0.75)
      )
        return false;
      if (filters.riskLevel === "low" && item.churnProbability > 0.4)
        return false;
      return true;
    });
  }, [history, filters]);

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

  // Función para exportar a Excel
  const handleExportToExcel = () => {
    // Preparar datos para exportación
    const exportData = filteredHistory.map((item) => {
      const insight = getBusinessInsight(item);
      const semaphore = getRiskSemaphore(item.churnProbability);

      return {
        "ID Cliente": item.customerId,
        Productos: item.numOfProducts,
        "Causal Técnica": insight.causalTecnica,
        "Causal de Negocio": insight.causalNegocio,
        "Acción Sugerida": insight.accionSugerida,
        Prioridad: insight.prioridad.toUpperCase(),
        "Impacto Estimado": insight.impactoEstimado,
        "Probabilidad de Churn": `${(item.churnProbability * 100).toFixed(1)}%`,
        "Nivel de Riesgo": semaphore.label,
        "Edad en Riesgo": item.ageRisk === 1 ? "Sí" : "No",
        "Cliente Inactivo": item.inactivo4070 === 1 ? "Sí" : "No",
        "Exceso Productos": item.productsRiskFlag === 1 ? "Sí" : "No",
        "País de Riesgo": item.countryRiskFlag === 1 ? "Sí" : "No",
        "Fecha de Predicción": formatDate(item.predictionDate),
      };
    });

    // Crear worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 20 }, // ID Cliente
      { wch: 10 }, // Productos
      { wch: 35 }, // Causal Técnica
      { wch: 25 }, // Causal de Negocio
      { wch: 30 }, // Acción Sugerida
      { wch: 12 }, // Prioridad
      { wch: 20 }, // Impacto Estimado
      { wch: 15 }, // Probabilidad
      { wch: 15 }, // Nivel de Riesgo
      { wch: 12 }, // Edad en Riesgo
      { wch: 15 }, // Cliente Inactivo
      { wch: 15 }, // Exceso Productos
      { wch: 12 }, // País de Riesgo
      { wch: 20 }, // Fecha
    ];
    ws["!cols"] = columnWidths;

    // Crear workbook y agregar worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Predicciones de Churn");

    // Generar nombre de archivo con fecha
    const today = new Date();
    const fileName = `ChurnInsight_${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, fileName);
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

      {/* KPIs Dashboard */}
      {!loading && history.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Card elevation={2} sx={{ borderLeft: "4px solid #d32f2f" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Clientes en Riesgo Crítico
              </Typography>
              <Typography variant="h3" color="error.main" fontWeight={700}>
                {kpis.totalHighRiskClients}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Probabilidad &gt; 75%
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ borderLeft: "4px solid #ed6c02" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Capital en Riesgo
              </Typography>
              <Typography variant="h3" color="warning.main" fontWeight={700}>
                ${(kpis.capitalAtRisk / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Suma de balances en riesgo
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ borderLeft: "4px solid #2e7d32" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Precisión del Modelo
              </Typography>
              <Typography variant="h3" color="success.main" fontWeight={700}>
                {(kpis.accuracyLastMonth * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mes anterior
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ borderLeft: "4px solid #1976d2" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Riesgo Promedio
              </Typography>
              <Typography
                variant="h3"
                sx={{ color: "#1976d2" }}
                fontWeight={700}
              >
                {kpis.averageRisk.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                De todos los clientes
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ borderLeft: "4px solid #1e3c72" }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Predicciones
              </Typography>
              <Typography
                variant="h3"
                sx={{ color: "#1e3c72" }}
                fontWeight={700}
              >
                {kpis.totalPredictions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Análisis realizados
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filtros */}
      {!loading && history.length > 0 && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Nivel de Riesgo</InputLabel>
            <Select
              value={filters.riskLevel}
              onChange={(e) =>
                setFilters({ ...filters, riskLevel: e.target.value })
              }
              label="Nivel de Riesgo"
            >
              <MenuItem value="all">Todos los niveles</MenuItem>
              <MenuItem value="critical">🔴 Crítico (&gt;75%)</MenuItem>
              <MenuItem value="medium">🟡 Medio (40-75%)</MenuItem>
              <MenuItem value="low">🟢 Bajo (&lt;40%)</MenuItem>
            </Select>
          </FormControl>
          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              Mostrando {filteredHistory.length} de {history.length}{" "}
              predicciones
            </Typography>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportToExcel}
              disabled={filteredHistory.length === 0}
              sx={{
                bgcolor: "#1e3c72",
                "&:hover": { bgcolor: "#2a5298" },
              }}
            >
              Exportar Excel
            </Button>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : filteredHistory.length === 0 ? (
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
            {history.length === 0
              ? "No hay predicciones previas"
              : "No hay resultados con los filtros seleccionados"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {history.length === 0
              ? "Las predicciones realizadas aparecerán aquí"
              : "Intenta ajustar los filtros para ver más resultados"}
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
                  Causal de Negocio
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Acción Sugerida
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: 700 }}
                  align="center"
                >
                  Semáforo de Riesgo
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>
                  Fecha de Predicción
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((item, index) => (
                <TableRow
                  key={item.id}
                  onClick={() => {
                    setSelectedCustomer(item);
                    setShowProfile(true);
                  }}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "#f8f9fa" },
                    "&:hover": { bgcolor: "#e3f2fd", cursor: "pointer" },
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
                    <Typography variant="body2" fontWeight={500}>
                      {item.numOfProducts}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={getBusinessInsight(item).causalTecnica}>
                      <Chip
                        label={getBusinessInsight(item).causalNegocio}
                        color={
                          getBusinessInsight(item).prioridad === "alta"
                            ? "error"
                            : getBusinessInsight(item).prioridad === "media"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={getBusinessInsight(item).impactoEstimado}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Lightbulb
                          sx={{
                            fontSize: 18,
                            color:
                              getBusinessInsight(item).prioridad === "alta"
                                ? "#d32f2f"
                                : getBusinessInsight(item).prioridad === "media"
                                ? "#ed6c02"
                                : "#757575",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          {getBusinessInsight(item).accionSugerida}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        bgcolor: getRiskSemaphore(item.churnProbability)
                          .bgColor,
                        borderRadius: 2,
                        p: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontSize: "1.2rem" }}>
                        {getRiskSemaphore(item.churnProbability).icon}
                      </Typography>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            color: getRiskSemaphore(item.churnProbability)
                              .color,
                          }}
                        >
                          {(item.churnProbability * 100).toFixed(1)}%
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.7rem" }}
                        >
                          {getRiskSemaphore(item.churnProbability).label}
                        </Typography>
                      </Box>
                    </Box>
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

      {filteredHistory.length > 0 && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Mostrando {filteredHistory.length}{" "}
            {filteredHistory.length !== history.length
              ? `de ${history.length}`
              : ""}{" "}
            predicciones
          </Typography>
        </Box>
      )}

      {/* Modal de Perfil de Riesgo */}
      {selectedCustomer && (
        <CustomerRiskProfile
          open={showProfile}
          onClose={() => setShowProfile(false)}
          customer={selectedCustomer}
          getBusinessInsight={getBusinessInsight}
        />
      )}
    </Box>
  );
};

export default HistoryPanel;
