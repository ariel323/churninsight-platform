import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
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
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Assessment,
  Analytics,
  Dashboard,
  History,
  Logout,
} from "@mui/icons-material";
import theme from "./theme";
import PredictionForm from "./PredictionForm";
import { predictChurn, fetchStats } from "./services/api";
import { ChurnPredictionRequest, ChurnPredictionResponse } from "./types";
import { Header } from "./components";
import Login from "./components/Login";

// Lazy loading de componentes pesados
const PredictionResults = lazy(() => import("./PredictionResults"));
const DashboardPanel = lazy(() => import("./components/DashboardPanel"));
const HistoryPanel = lazy(() => import("./components/HistoryPanel"));

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [prediction, setPrediction] = useState<ChurnPredictionResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<{
    activeUsers: number | null;
    retentionRate: number | null;
    todayPredictions: number | null;
  } | null>(null);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    console.log("[APP] Verificando sesión al cargar...");
    console.log("[APP] Token presente:", Boolean(token));
    console.log("[APP] Username presente:", Boolean(savedUsername));

    if (token && savedUsername) {
      // Validar que el token no esté expirado
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiry = payload.exp * 1000;
        const now = Date.now();

        if (expiry > now) {
          console.log("[APP] Token válido, restaurando sesión");
          setIsAuthenticated(true);
          setUsername(savedUsername);
        } else {
          console.warn("[APP] Token expirado, limpiando sesión");
          localStorage.removeItem("token");
          localStorage.removeItem("username");
        }
      } catch (e) {
        console.error("[APP] Error validando token:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
      }
    } else {
      console.log("[APP] No hay sesión guardada");
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadStats = async () => {
      try {
        const statsData = await fetchStats();
        setStats(statsData);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setStats({
          activeUsers: null,
          retentionRate: null,
          todayPredictions: null,
        });
      }
    };
    loadStats();
  }, [isAuthenticated]);

  const handleLoginSuccess = useCallback((token: string, user: string) => {
    setIsAuthenticated(true);
    setUsername(user);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUsername("");
    setPrediction(null);
    setError(null);
    setTabValue(0);
  }, []);

  const handlePrediction = useCallback(
    async (formData: ChurnPredictionRequest) => {
      setLoading(true);
      setError(null);
      setPrediction(null);

      try {
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
    },
    [],
  );

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    [],
  );

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}
      >
        {/* Header con botón de logout */}
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bienvenido, {username}
          </Typography>
          <Tooltip title="Cerrar Sesión">
            <IconButton
              onClick={handleLogout}
              sx={{ color: "white" }}
              aria-label="Cerrar sesión"
            >
              <Logout aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </Box>

        <Header stats={stats || undefined} />
        <Container
          component="main"
          maxWidth="xl"
          sx={{ mt: 3, mb: 4, px: { xs: 2, sm: 3 } }}
        >
          <Paper
            elevation={1}
            sx={{
              borderRadius: { xs: 4, sm: 8 },
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
              bgcolor: "background.paper",
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
                      color: "#1a3a5c",
                      bgcolor: "rgba(26, 58, 92, 0.04)",
                    },
                  },
                  "& .MuiTabs-indicator": { height: 3, bgcolor: "#1a3a5c" },
                }}
              >
                <Tab
                  icon={<Assessment sx={{ fontSize: 28 }} aria-hidden="true" />}
                  label="Evaluación de Cliente"
                  iconPosition="start"
                />
                <Tab
                  icon={<Analytics sx={{ fontSize: 28 }} aria-hidden="true" />}
                  label="Resultado de Predicción"
                  iconPosition="start"
                  disabled={!prediction && !error}
                />
                <Tab
                  icon={<Dashboard sx={{ fontSize: 28 }} aria-hidden="true" />}
                  label="Dashboard de Retención"
                  iconPosition="start"
                  disabled={!prediction}
                />
                <Tab
                  icon={<History sx={{ fontSize: 28 }} aria-hidden="true" />}
                  label="Historial de Análisis"
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
                      color: "#1a3a5c",
                    }}
                  >
                    Sistema de Predicción de Churn Bancario
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 800, mx: "auto" }}
                  >
                    Evalúe el riesgo de abandono de clientes bancarios mediante
                    análisis predictivo basado en Machine Learning.
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
                      aria-hidden="true"
                    />
                    <Typography variant="h6" color="text.secondary">
                      Sin resultados disponibles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete la evaluación del cliente para ver el análisis
                      predictivo
                    </Typography>
                  </Box>
                )}
                {(prediction || error) && (
                  <Suspense
                    fallback={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 4,
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    }
                  >
                    <PredictionResults prediction={prediction} error={error} />
                  </Suspense>
                )}
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {prediction && (
                <Suspense
                  fallback={
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 4 }}
                    >
                      <CircularProgress />
                    </Box>
                  }
                >
                  <DashboardPanel prediction={prediction} />
                </Suspense>
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Suspense
                fallback={
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress />
                  </Box>
                }
              >
                <HistoryPanel />
              </Suspense>
            </TabPanel>
          </Paper>
        </Container>
        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: "center",
            color: "text.secondary",
            bgcolor: "#f4f6f8",
            borderTop: "2px solid #1a3a5c",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            ChurnInsight Banking 2026 | Sistema de Retención de Clientes
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}
          >
            Powered by XGBoost Machine Learning | Spring Boot Backend
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
