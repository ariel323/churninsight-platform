import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Container,
  Avatar,
  Link as MuiLink,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AccountBalance,
  Lock,
  Person,
  Email,
  BadgeOutlined,
} from "@mui/icons-material";
import { API_BASE_URL } from "../services/api";

interface LoginProps {
  onLoginSuccess: (token: string, username: string) => void;
}

type ViewMode = "login" | "register";

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para recuperación de contraseña
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = "Error de autenticación";
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          message = parsed?.message || parsed?.error || message;
        } catch {
          if (raw) message = raw;
        }
        throw new Error(message);
      }

      const data = await response.json();

      // Guardar token y roles en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      // Guardar roles si están disponibles
      if (data.roles && Array.isArray(data.roles)) {
        localStorage.setItem("roles", JSON.stringify(data.roles));
      }

      onLoginSuccess(data.token, data.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validaciones
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Email inválido");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email, fullName }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = "Error al registrar usuario";
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          message = parsed?.error || parsed?.message || message;
        } catch {
          if (raw) message = raw;
        }
        throw new Error(message);
      }

      setSuccess(
        "✓ Usuario registrado exitosamente. Ya puedes iniciar sesión."
      );

      // Limpiar campos y cambiar a login después de 2 segundos
      setTimeout(() => {
        setUsername("");
        setPassword("");
        setEmail("");
        setFullName("");
        setViewMode("login");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al registrar usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = "Error al solicitar recuperación";
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          message = parsed?.error || parsed?.message || message;
        } catch {
          if (raw) message = raw;
        }
        throw new Error(message);
      }

      const data = await response.json();
      setSuccess(data.message);
      setResetToken(data.token || "");
      setShowResetForm(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al solicitar recuperación"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = "Error al restablecer contraseña";
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          message = parsed?.error || parsed?.message || message;
        } catch {
          if (raw) message = raw;
        }
        throw new Error(message);
      }

      setSuccess("✓ Contraseña restablecida exitosamente");
      setTimeout(() => {
        setShowForgotPassword(false);
        setShowResetForm(false);
        setForgotEmail("");
        setResetToken("");
        setNewPassword("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al restablecer contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.98)",
          }}
        >
          {/* Logo y Título */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                margin: "0 auto 20px",
              }}
            >
              <AccountBalance sx={{ fontSize: 50 }} aria-hidden="true" />
            </Avatar>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              ChurnInsight Banking
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sistema de Análisis de Retención
            </Typography>
          </Box>

          {/* Tabs para Login/Registro */}
          <Tabs
            value={viewMode}
            onChange={(_, newValue) => {
              setViewMode(newValue);
              setError("");
              setSuccess("");
            }}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Iniciar Sesión" value="login" />
            <Tab label="Registrarse" value="register" />
          </Tabs>

          {/* Vista de Login */}
          {viewMode === "login" && (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Usuario"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={!loading ? <Lock aria-hidden="true" /> : null}
                sx={{
                  py: 1.8,
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderRadius: 2,
                  mb: 2,
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #42A5F5 90%)",
                  boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .3)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1976D2 30%, #2196F3 90%)",
                    boxShadow: "0 4px 8px 3px rgba(33, 150, 243, .4)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    background:
                      "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Autenticando..." : "Acceso Seguro"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <MuiLink
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => setShowForgotPassword(true)}
                  sx={{ cursor: "pointer" }}
                >
                  ¿Olvidaste tu contraseña?
                </MuiLink>
              </Box>
            </form>
          )}

          {/* Vista de Registro */}
          {viewMode === "register" && (
            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Nombre Completo"
                variant="outlined"
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlined color="action" aria-hidden="true" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Usuario"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                helperText="Mínimo 4 caracteres"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" aria-hidden="true" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" aria-hidden="true" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                helperText="Mínimo 8 caracteres"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" aria-hidden="true" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff aria-hidden="true" />
                        ) : (
                          <Visibility aria-hidden="true" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={!loading ? <Person aria-hidden="true" /> : null}
                sx={{
                  py: 1.8,
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderRadius: 2,
                  mb: 2,
                  background:
                    "linear-gradient(45deg, #66BB6A 30%, #81C784 90%)",
                  boxShadow: "0 3px 5px 2px rgba(102, 187, 106, .3)",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)",
                    boxShadow: "0 4px 8px 3px rgba(102, 187, 106, .4)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    background:
                      "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Creando Cuenta..." : "Registrar Cuenta"}
              </Button>
            </form>
          )}

          {/* Footer */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 ChurnInsight Banking. Todos los derechos reservados.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Dialog para recuperación de contraseña */}
      <Dialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      >
        <DialogTitle>Recuperar Contraseña</DialogTitle>
        <DialogContent>
          {!showResetForm ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Ingresa tu email para recibir un token de recuperación.
              </Typography>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={loading}
                sx={{ mt: 1 }}
              />
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Token generado: <strong>{resetToken}</strong>
                <br />
                <Typography variant="caption">
                  En producción, este token se enviaría por email.
                </Typography>
              </Alert>
              <TextField
                fullWidth
                label="Token de Recuperación"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Nueva Contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                helperText="Mínimo 8 caracteres"
              />
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowForgotPassword(false);
              setShowResetForm(false);
              setError("");
              setSuccess("");
            }}
          >
            Cancelar
          </Button>
          {!showResetForm ? (
            <Button
              onClick={handleForgotPassword}
              variant="contained"
              disabled={loading || !forgotEmail}
            >
              Enviar Token
            </Button>
          ) : (
            <Button
              onClick={handleResetPassword}
              variant="contained"
              disabled={loading || !resetToken || !newPassword}
            >
              Restablecer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
