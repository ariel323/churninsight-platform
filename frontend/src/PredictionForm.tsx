import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Paper,
  Chip,
} from "@mui/material";
import {
  Info,
  Person,
  AttachMoney,
  Star,
  TrendingUp,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { FormData } from "./types";

interface PredictionFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({
  onSubmit,
  loading,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      customer_id: "",
      age: "",
      income_level: "Medio",
      total_transactions: "",
      avg_transaction_value: "",
      active_days: "",
      app_usage_frequency: "Semanal",
      customer_satisfaction_score: "",
      last_transaction_days_ago: "",
    },
  });

  const onFormSubmit = (data: FormData) => {
    const sanitizedData = {
      customer_id: data.customer_id.trim(),
      age: parseInt(data.age, 10),
      income_level: data.income_level,
      total_transactions: parseInt(data.total_transactions, 10),
      avg_transaction_value: parseFloat(data.avg_transaction_value),
      active_days: parseInt(data.active_days, 10),
      app_usage_frequency: data.app_usage_frequency,
      customer_satisfaction_score: parseInt(
        data.customer_satisfaction_score,
        10
      ),
      last_transaction_days_ago: parseInt(data.last_transaction_days_ago, 10),
    };
    onSubmit(sanitizedData);
  };

  // Watch values for real-time calculations
  const watchAllFields = watch();
  const totalTransactions = parseInt(watchAllFields.total_transactions) || 0;
  const avgTransactionValue =
    parseFloat(watchAllFields.avg_transaction_value) || 0;
  const estimatedLTV = totalTransactions * avgTransactionValue;

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} sx={{ mt: 3 }}>
      <Paper
        elevation={2}
        sx={{ p: 3, mb: 3, bgcolor: "primary.main", color: "white" }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Person sx={{ mr: 1 }} />
          Información del Cliente
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Complete todos los campos para realizar una predicción precisa
        </Typography>
      </Paper>

      {/* Sección de Datos Personales */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
          Datos Personales
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="customer_id"
              control={control}
              rules={{
                required: "ID del cliente es obligatorio",
                maxLength: { value: 100, message: "Máximo 100 caracteres" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="ID del Cliente"
                  error={!!errors.customer_id}
                  helperText={errors.customer_id?.message}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Identificador único del cliente en el sistema">
                        <IconButton size="small">
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="age"
              control={control}
              rules={{
                required: "Edad es obligatoria",
                min: { value: 18, message: "Edad mínima 18 años" },
                max: { value: 70, message: "Edad máxima 70 años" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Edad"
                  error={!!errors.age}
                  helperText={errors.age?.message || "Entre 18 y 70 años"}
                  InputProps={{
                    endAdornment: (
                      <Chip
                        label="años"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="income_level"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Nivel de Ingreso</InputLabel>
                  <Select {...field} label="Nivel de Ingreso">
                    <MenuItem value="Bajo">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AttachMoney />
                        Bajo
                      </Box>
                    </MenuItem>
                    <MenuItem value="Medio">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AttachMoney />
                        <AttachMoney />
                        Medio
                      </Box>
                    </MenuItem>
                    <MenuItem value="Alto">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AttachMoney />
                        <AttachMoney />
                        <AttachMoney />
                        Alto
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>

          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="app_usage_frequency"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Frecuencia de Uso de la App</InputLabel>
                  <Select {...field} label="Frecuencia de Uso de la App">
                    <MenuItem value="Diaria">📱 Diaria</MenuItem>
                    <MenuItem value="Semanal">📅 Semanal</MenuItem>
                    <MenuItem value="Mensual">📆 Mensual</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>
        </Box>
      </Paper>

      {/* Sección de Actividad Transaccional */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          color="primary"
          sx={{ mb: 2, display: "flex", alignItems: "center" }}
        >
          <TrendingUp sx={{ mr: 1 }} />
          Actividad Transaccional
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="total_transactions"
              control={control}
              rules={{
                required: "Total de transacciones es obligatorio",
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Total de Transacciones"
                  error={!!errors.total_transactions}
                  helperText={errors.total_transactions?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="avg_transaction_value"
              control={control}
              rules={{
                required: "Valor promedio es obligatorio",
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Valor Promedio de Transacción"
                  error={!!errors.avg_transaction_value}
                  helperText={errors.avg_transaction_value?.message}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="active_days"
              control={control}
              rules={{
                required: "Días activos son obligatorios",
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Días Activos"
                  error={!!errors.active_days}
                  helperText={
                    errors.active_days?.message ||
                    "Días que el cliente ha estado activo"
                  }
                  InputProps={{
                    endAdornment: (
                      <Chip
                        label="días"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ),
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "280px" }}>
            <Controller
              name="last_transaction_days_ago"
              control={control}
              rules={{
                required: "Días desde última transacción son obligatorios",
                min: { value: 0, message: "Debe ser mayor o igual a 0" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Días desde Última Transacción"
                  error={!!errors.last_transaction_days_ago}
                  helperText={errors.last_transaction_days_ago?.message}
                  InputProps={{
                    endAdornment: (
                      <Chip
                        label="días"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ),
                  }}
                />
              )}
            />
          </Box>
        </Box>

        {estimatedLTV > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "success.light", borderRadius: 2 }}>
            <Typography variant="body2" color="success.dark" fontWeight="bold">
              💰 Valor Estimado Generado: ${estimatedLTV.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Sección de Satisfacción */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          color="primary"
          sx={{ mb: 2, display: "flex", alignItems: "center" }}
        >
          <Star sx={{ mr: 1 }} />
          Satisfacción del Cliente
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <Box sx={{ width: "100%" }}>
            <Controller
              name="customer_satisfaction_score"
              control={control}
              rules={{
                required: "Puntuación de satisfacción es obligatoria",
                min: { value: 1, message: "Debe ser entre 1 y 10" },
                max: { value: 10, message: "Debe ser entre 1 y 10" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Puntuación de Satisfacción"
                  error={!!errors.customer_satisfaction_score}
                  helperText={
                    errors.customer_satisfaction_score?.message ||
                    "Escala de 1 (muy insatisfecho) a 10 (muy satisfecho)"
                  }
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {[...Array(parseInt(field.value) || 0)].map((_, i) => (
                          <Star key={i} fontSize="small" color="warning" />
                        ))}
                      </Box>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1.1rem",
            minWidth: 250,
          }}
        >
          {loading ? "🔄 Analizando..." : "🎯 Predecir Riesgo de Churn"}
        </Button>
      </Box>
    </Box>
  );
};

export default PredictionForm;
