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
  Tabs,
  Tab,
  Pagination,
  TextField,
} from "@mui/material";
import { PersonOutline, Lightbulb, FileDownload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import {
  fetchHistory,
  fetchAllHistory,
  fetchKPIs,
  PredictionHistory,
  KPIsData,
  isAdmin,
  AnalystSummary,
  fetchAnalystSummaries,
  fetchHistoryByAnalyst,
  fetchHistoryByAnalystRange,
  Page,
  AnalystPeriodReport,
  fetchAnalystPeriodReport,
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
  const [allHistory, setAllHistory] = useState<PredictionHistory[]>([]);
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
  const [viewMode, setViewMode] = useState<"mine" | "all" | "analysts">("mine");
  const [analystSummaries, setAnalystSummaries] = useState<AnalystSummary[]>(
    []
  );
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>("");
  const [analystPage, setAnalystPage] = useState<Page<PredictionHistory>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 50,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const pageSize = 100;
  const [analystSearch, setAnalystSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [granularity, setGranularity] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [periodReport, setPeriodReport] = useState<AnalystPeriodReport[]>([]);

  const filteredAnalysts = useMemo(() => {
    const q = analystSearch.trim().toLowerCase();
    if (!q) return analystSummaries;
    return analystSummaries.filter((a) => {
      const name = (a.fullName || "").toLowerCase();
      const user = (a.username || "").toLowerCase();
      const mail = (a.email || "").toLowerCase();
      return name.includes(q) || user.includes(q) || (mail && mail.includes(q));
    });
  }, [analystSummaries, analystSearch]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchHistory();
    setHistory(data);
    setLoading(false);
  };

  const loadAllHistory = async (page: number = 0) => {
    setLoading(true);
    const data = await fetchAllHistory(page, pageSize);
    setAllHistory(data.content);
    setTotalElements(data.totalElements);
    setTotalPages(data.totalPages);
    setCurrentPage(page);
    setLoading(false);
  };

  const loadKPIs = async () => {
    const data = await fetchKPIs();
    setKpis(data);
  };

  useEffect(() => {
    // Verificar si el usuario es admin
    const adminStatus = isAdmin();
    setUserIsAdmin(adminStatus);
    console.log("[HistoryPanel] Usuario es admin:", adminStatus);

    loadHistory();
    loadKPIs();
  }, []);

  useEffect(() => {
    if (viewMode === "all" && userIsAdmin) {
      loadAllHistory(0);
    } else if (viewMode === "analysts" && userIsAdmin) {
      // cargar resumen de analistas
      (async () => {
        setLoading(true);
        try {
          const summaries = await fetchAnalystSummaries();
          setAnalystSummaries(summaries);
          // Seleccionar el primero por defecto si existe
          if (summaries.length > 0) {
            setSelectedAnalyst(summaries[0].username);
            const page = await fetchHistoryByAnalyst(
              summaries[0].username,
              0,
              50
            );
            setAnalystPage(page);
            // Sugerir rango del mes actual por defecto
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const fmt = (d: Date) =>
              `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
              )}-${String(d.getDate()).padStart(2, "0")}`;
            setFromDate(fmt(start));
            setToDate(fmt(end));
          } else {
            setAnalystPage({
              content: [],
              totalElements: 0,
              totalPages: 0,
              number: 0,
              size: 50,
            });
          }
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [viewMode, userIsAdmin]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    loadAllHistory(page - 1);
  };

  const handleViewModeChange = (
    _event: React.SyntheticEvent,
    newValue: "mine" | "all" | "analysts"
  ) => {
    setViewMode(newValue);
    setFilters({ riskLevel: "all" });
  };

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

  // Filtrar historial
  const filteredHistory = useMemo(() => {
    const dataSource = viewMode === "mine" ? history : allHistory;

    return dataSource.filter((item) => {
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
  }, [viewMode, history, allHistory, filters]);

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

  // Exportar historial del analista seleccionado a Excel
  const handleExportAnalystToExcel = () => {
    if (!analystPage.content || analystPage.content.length === 0) return;

    const exportData = analystPage.content.map((item) => {
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
        "Fecha de Predicción": formatDate(item.predictionDate),
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 35 },
      { wch: 25 },
      { wch: 30 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = selectedAnalyst
      ? `Historial_${selectedAnalyst}`
      : "Historial_Analista";
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const today = new Date();
    const fileName = `ChurnInsight_${sheetName}_${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Exportar historial del analista del rango completo (todas las páginas)
  const [exportingRange, setExportingRange] = useState(false);
  const handleExportAnalystRangeToExcel = async () => {
    if (!selectedAnalyst || !fromDate || !toDate) return;
    setExportingRange(true);
    try {
      const size = 200; // tamaño de página grande para acelerar
      let page = 0;
      const rows: PredictionHistory[] = [];
      // Obtener la primera página para conocer totalPages
      const first = await fetchHistoryByAnalystRange(
        selectedAnalyst,
        fromDate,
        toDate,
        page,
        size
      );
      rows.push(...first.content);
      const totalPages = first.totalPages;
      for (let p = 1; p < totalPages; p++) {
        const next = await fetchHistoryByAnalystRange(
          selectedAnalyst,
          fromDate,
          toDate,
          p,
          size
        );
        rows.push(...next.content);
      }

      if (rows.length === 0) return;
      const exportData = rows.map((item) => {
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
          "Probabilidad de Churn": `${(item.churnProbability * 100).toFixed(
            1
          )}%`,
          "Nivel de Riesgo": semaphore.label,
          "Fecha de Predicción": formatDate(item.predictionDate),
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [
        { wch: 20 },
        { wch: 10 },
        { wch: 35 },
        { wch: 25 },
        { wch: 30 },
        { wch: 12 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
      ];
      const wb = XLSX.utils.book_new();
      const sheetName = `Historial_Rango_${selectedAnalyst}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const fileName = `ChurnInsight_${sheetName}_${fromDate}_a_${toDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } finally {
      setExportingRange(false);
    }
  };

  // Exportar resumen por periodo a Excel
  const handleExportPeriodReportToExcel = () => {
    if (!periodReport || periodReport.length === 0) return;
    const exportData = periodReport.map((r) => ({
      Año: r.year,
      Mes: granularity === "monthly" ? r.month ?? "" : "",
      "Total Análisis": r.totalAnalyses,
      "Alto Riesgo": r.highRiskCount,
      "Promedio (%)": (r.averageChurnProbability * 100).toFixed(1),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 6 },
      { wch: 16 },
      { wch: 12 },
      { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    const sheetName = selectedAnalyst
      ? `Resumen_${granularity}_${selectedAnalyst}`
      : `Resumen_${granularity}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const today = new Date();
    const fileName = `ChurnInsight_${sheetName}_${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.xlsx`;
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
          Análisis de riesgo de abandono bancario
        </Typography>
      </Box>

      {/* Tabs para cambiar entre vistas */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          aria-label="Vistas de historial"
        >
          <Tab
            label={`Mis Análisis (${history.length})`}
            value="mine"
            sx={{ fontWeight: viewMode === "mine" ? 700 : 400 }}
          />
          {/* Solo mostrar pestaña "Todos los Análisis" si el usuario es ADMIN */}
          {isAdmin() && (
            <Tab
              label={`Todos los Análisis (${totalElements.toLocaleString()})`}
              value="all"
              sx={{ fontWeight: viewMode === "all" ? 700 : 400 }}
            />
          )}
          {isAdmin() && (
            <Tab
              label={`Por Analista${
                analystSummaries.length > 0
                  ? ` (${analystSummaries.length})`
                  : ""
              }`}
              value="analysts"
              sx={{ fontWeight: viewMode === "analysts" ? 700 : 400 }}
            />
          )}
        </Tabs>
      </Box>

      {/* KPIs Dashboard */}
      {!loading &&
        (viewMode === "mine" ? history.length > 0 : allHistory.length > 0) && (
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
                  {kpis.capitalAtRisk >= 1000000
                    ? `$${(kpis.capitalAtRisk / 1000000).toLocaleString(
                        "es-ES",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        }
                      )}M`
                    : `$${kpis.capitalAtRisk.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
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

      {viewMode === "analysts" && userIsAdmin ? (
        <Box>
          {/* Selector de analista */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <TextField
              label="Buscar (nombre, usuario, correo)"
              variant="outlined"
              value={analystSearch}
              onChange={(e) => setAnalystSearch(e.target.value)}
              fullWidth
              sx={{ minWidth: { sm: 280 }, flex: "1 1 280px" }}
            />
            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel>Analista</InputLabel>
              <Select
                value={selectedAnalyst}
                label="Analista"
                onChange={async (e) => {
                  const u = e.target.value as string;
                  setSelectedAnalyst(u);
                  setLoading(true);
                  try {
                    const page = await fetchHistoryByAnalyst(u, 0, 50);
                    setAnalystPage(page);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {filteredAnalysts.map((a) => (
                  <MenuItem key={a.username} value={a.username}>
                    {a.fullName ? `${a.fullName} (${a.username})` : a.username}
                    {a.email ? ` · ${a.email}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Rango de fechas */}
            <TextField
              label="Desde"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ minWidth: { sm: 180 }, flex: "1 1 160px" }}
            />
            <TextField
              label="Hasta"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ minWidth: { sm: 180 }, flex: "1 1 160px" }}
            />
            <Button
              variant="outlined"
              onClick={async () => {
                if (!selectedAnalyst || !fromDate || !toDate) return;
                setLoading(true);
                try {
                  const page = await fetchHistoryByAnalystRange(
                    selectedAnalyst,
                    fromDate,
                    toDate,
                    0,
                    50
                  );
                  setAnalystPage(page);
                  const summary = await fetchAnalystPeriodReport(
                    selectedAnalyst,
                    fromDate,
                    toDate,
                    granularity
                  );
                  setPeriodReport(summary);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Aplicar
            </Button>

            {/* KPIs compactos por analista */}
            {selectedAnalyst && (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {analystSummaries
                  .filter((a) => a.username === selectedAnalyst)
                  .map((a) => (
                    <Card key={a.username} elevation={2}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {a.fullName || a.username}
                        </Typography>
                        {a.email && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 1 }}
                          >
                            {a.email}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          Total análisis: <b>{a.totalAnalyses}</b>
                        </Typography>
                        <Typography variant="body2">
                          Último:{" "}
                          <b>
                            {new Date(a.lastPredictionDate).toLocaleString(
                              "es-ES"
                            )}
                          </b>
                        </Typography>
                        <Typography variant="body2">
                          Riesgo medio:{" "}
                          <b>{(a.averageChurnProbability * 100).toFixed(1)}%</b>
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            )}
          </Box>

          {/* Acciones */}
          {selectedAnalyst && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Granularidad</InputLabel>
                <Select
                  value={granularity}
                  label="Granularidad"
                  onChange={(e) => setGranularity(e.target.value as any)}
                >
                  <MenuItem value="monthly">Mensual</MenuItem>
                  <MenuItem value="yearly">Anual</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExportPeriodReportToExcel}
                  disabled={periodReport.length === 0}
                >
                  Exportar Resumen
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExportAnalystRangeToExcel}
                  disabled={
                    exportingRange || !selectedAnalyst || !fromDate || !toDate
                  }
                >
                  Exportar Rango Completo
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={handleExportAnalystToExcel}
                  disabled={analystPage.content.length === 0}
                  sx={{ bgcolor: "#1e3c72", "&:hover": { bgcolor: "#2a5298" } }}
                >
                  Exportar Excel
                </Button>
              </Box>
            </Box>
          )}

          {/* Resumen por periodo (mensual/anual) */}
          {periodReport.length > 0 && (
            <TableContainer
              component={Paper}
              elevation={3}
              sx={{ mt: 2, overflowX: "auto" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#1e3c72" }}>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      Año
                    </TableCell>
                    {granularity === "monthly" && (
                      <TableCell sx={{ color: "white", fontWeight: 700 }}>
                        Mes
                      </TableCell>
                    )}
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      Total Análisis
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      Alto Riesgo
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      Promedio (%)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periodReport.map((r, idx) => (
                    <TableRow
                      key={`${r.year}-${r.month ?? "y"}-${idx}`}
                      sx={{ "&:nth-of-type(odd)": { bgcolor: "#f8f9fa" } }}
                    >
                      <TableCell>{r.year}</TableCell>
                      {granularity === "monthly" && (
                        <TableCell>{r.month}</TableCell>
                      )}
                      <TableCell>{r.totalAnalyses}</TableCell>
                      <TableCell>{r.highRiskCount}</TableCell>
                      <TableCell>
                        {(r.averageChurnProbability * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tabla de historial por analista */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : analystPage.content.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
              <Typography>No hay predicciones para este analista.</Typography>
            </Paper>
          ) : (
            <TableContainer
              component={Paper}
              elevation={3}
              sx={{ overflowX: "auto" }}
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
                      Riesgo
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      Fecha
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analystPage.content.map((item) => (
                    <TableRow
                      key={item.id}
                      sx={{ "&:nth-of-type(odd)": { bgcolor: "#f8f9fa" } }}
                    >
                      <TableCell>{item.customerId}</TableCell>
                      <TableCell>{item.numOfProducts}</TableCell>
                      <TableCell align="center">
                        {(item.churnProbability * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {new Date(item.predictionDate).toLocaleString("es-ES")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Paginación analista */}
          {analystPage.totalPages > 1 && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={analystPage.totalPages}
                page={analystPage.number + 1}
                onChange={async (_e, p) => {
                  setLoading(true);
                  try {
                    const page = await fetchHistoryByAnalyst(
                      selectedAnalyst,
                      p - 1,
                      analystPage.size
                    );
                    setAnalystPage(page);
                  } finally {
                    setLoading(false);
                  }
                }}
                color="primary"
              />
            </Box>
          )}
        </Box>
      ) : loading ? (
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

      {/* Paginación para vista "Todos los Análisis" */}
      {viewMode === "all" && totalPages > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={currentPage + 1}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {filteredHistory.length > 0 && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Mostrando {filteredHistory.length}{" "}
            {viewMode === "all" && totalElements > 0
              ? `de ${totalElements.toLocaleString()}`
              : viewMode === "mine" && filteredHistory.length !== history.length
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
