import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Security,
  Notifications,
  Settings,
} from "@mui/icons-material";

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
        background:
          "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)",
        borderBottom: "3px solid #fbbf24",
      }}
    >
      <Toolbar sx={{ py: 1.5 }}>
        <AccountBalanceWallet sx={{ mr: 2, fontSize: 40, color: "#fbbf24" }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          >
            WalletInsight Pro
          </Typography>
          <Typography
            variant="caption"
            sx={{ opacity: 0.95, fontSize: "0.75rem" }}
          >
            Plataforma de Inteligencia Predictiva | Billetera Digital
          </Typography>
        </Box>

        {/* Badges y notificaciones */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            icon={<Security sx={{ color: "white !important" }} />}
            label="Seguro"
            size="small"
            sx={{
              bgcolor: "rgba(34, 197, 94, 0.9)",
              color: "white",
              fontWeight: 600,
              px: 1,
            }}
          />
          <Chip
            label="IA Avanzada"
            size="small"
            sx={{
              bgcolor: "rgba(251, 191, 36, 0.95)",
              color: "#1e3c72",
              fontWeight: 700,
              px: 1,
            }}
          />
          <IconButton size="small" sx={{ color: "white" }}>
            <Notifications />
          </IconButton>
          <IconButton size="small" sx={{ color: "white" }}>
            <Settings />
          </IconButton>
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
              Usuarios Activos
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
