import React, { useState, useEffect } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Fade,
} from "@mui/material";
import { Assessment, Analytics, Dashboard, History } from "@mui/icons-material";
import theme from "./theme";
import PredictionForm from "./PredictionForm";
import PredictionResults from "./PredictionResults";
import { predictChurn, fetchStats } from "./services/api";
import { PredictionRequest, PredictionResponse } from "./types";
import { Header, DashboardPanel, HistoryPanel } from "./components";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={true} timeout={600}>
          <Box sx={{ p: 4 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

function App() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<{
    activeUsers: number;
    retentionRate: number;
    todayPredictions: number;
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await fetchStats();
        setStats(statsData);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setStats({ activeUsers: 0, retentionRate: 0, todayPredictions: 0 });
      }
    };
    loadStats();
  }, []);

  const handlePrediction = async (formData: PredictionRequest) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      if (formData.age < 18 || formData.age > 70) {
        throw new Error("La edad debe estar entre 18 y 70 años");
      }

      if (
        formData.customer_satisfaction_score < 1 ||
        formData.customer_satisfaction_score > 10
      ) {
        throw new Error(
          "La puntuación de satisfacción debe estar entre 1 y 10"
        );
      }

      const result = await predictChurn(formData);
      setPrediction(result);

      const statsData = await fetchStats();
      setStats(statsData);

      setTabValue(1);
    } catch (err) {
      console.error("Error en la petición:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al conectar con el servidor";
      setError(errorMessage);
      setTabValue(1);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f0f2f5" }}>
        <Header stats={stats || undefined} />
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="ChurnInsight navigation tabs"
                variant="fullWidth"
                sx={{
                  bgcolor: "#ffffff",
                  borderBottom: "3px solid #fbbf24",
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    py: 2.5,
                    color: "#6b7280",
                    minHeight: 72,
                    "&.Mui-selected": {
                      color: "#1e3c72",
                      bgcolor: "rgba(30, 60, 114, 0.04)",
                    },
                  },
                  "& .MuiTabs-indicator": { height: 3, bgcolor: "#1e3c72" },
                }}
              >
                <Tab
                  icon={<Assessment sx={{ fontSize: 28 }} />}
                  label="Análisis de Usuario"
                  iconPosition="start"
                />
                <Tab
                  icon={<Analytics sx={{ fontSize: 28 }} />}
                  label="Predicción IA"
                  iconPosition="start"
                  disabled={!prediction && !error}
                />
                <Tab
                  icon={<Dashboard sx={{ fontSize: 28 }} />}
                  label="Panel de Retención"
                  iconPosition="start"
                  disabled={!prediction}
                />
                <Tab
                  icon={<History sx={{ fontSize: 28 }} />}
                  label="Historial"
                  iconPosition="start"
                />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Box>
                <Box sx={{ mb: 4, textAlign: "center" }}>
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
                    Análisis Predictivo de Retención
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 800, mx: "auto" }}
                  >
                    Complete el perfil del usuario de su billetera digital para
                    obtener una predicción en tiempo real con IA avanzada.
                    Precisión del modelo: 98.5%
                  </Typography>
                </Box>
                <PredictionForm onSubmit={handlePrediction} loading={loading} />
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Box>
                {!prediction && !error && (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Analytics
                      sx={{ fontSize: 80, color: "text.disabled", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No hay resultados aún
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete el formulario de evaluación para ver los
                      resultados
                    </Typography>
                  </Box>
                )}
                {(prediction || error) && (
                  <PredictionResults prediction={prediction} error={error} />
                )}
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {prediction && <DashboardPanel prediction={prediction} />}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <HistoryPanel />
            </TabPanel>
          </Paper>
        </Container>
        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: "center",
            color: "text.secondary",
            bgcolor: "#f8f9fa",
            borderTop: "3px solid #fbbf24",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            WalletInsight Pro 2025 | Plataforma de Inteligencia Predictiva
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}
          >
            Powered by IA Avanzada Machine Learning Spring Boot
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
