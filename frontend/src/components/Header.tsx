import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { AccountBalanceWallet } from "@mui/icons-material";

interface HeaderProps {
  stats?: {
    activeUsers: number;
    retentionRate: number;
    todayPredictions: number;
  };
}

const Header: React.FC<HeaderProps> = ({ stats }) => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid #e0e0e0",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ py: 1.5 }}>
        <AccountBalanceWallet
          sx={{ mr: 2, fontSize: 40, color: "primary.main" }}
          aria-label="Icono de banco"
          role="img"
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: 700, letterSpacing: 0.5, color: "text.primary" }}
          >
            ChurnInsight Banking
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.75rem" }}
          >
            Sistema de Predicción de Abandono | Análisis Bancario
          </Typography>
        </Box>
      </Toolbar>

      {/* Barra de estadísticas - Datos dinámicos del backend */}
      {stats && (
        <Box
          sx={{
            bgcolor: "rgba(0,0,0,0.15)",
            py: 1,
            px: 3,
            display: "flex",
            justifyContent: "center",
            gap: 6,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontSize: "0.7rem" }}
            >
              Clientes Analizados
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, fontSize: "0.9rem" }}
            >
              {stats.activeUsers.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontSize: "0.7rem" }}
            >
              Tasa de Retención
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#22c55e" }}
            >
              {stats.retentionRate.toFixed(1)}%
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontSize: "0.7rem" }}
            >
              Predicciones Hoy
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, fontSize: "0.9rem" }}
            >
              {stats.todayPredictions.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      )}
    </AppBar>
  );
};

export default Header;
