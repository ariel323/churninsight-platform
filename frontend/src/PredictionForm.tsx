import React, { useCallback, useMemo } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from "@mui/material";
import { Person, Info } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";

import { ChurnPredictionRequest } from "./types";

// Interfaz interna para el formulario (datos que ingresa el usuario)
interface ClientFormData extends Omit<
  ChurnPredictionRequest,
  "recentInactive" | "productUsageDrop" | "hadComplaint"
> {
  recentInactive: number;
  productUsageDrop: number;
  hadComplaint: number;
}

// Tipos alineados con el modelo de backend/data-science
export interface ChurnFormData {
  ageRisk: number;
  numOfProducts: number;
  inactivo4070: number;
  productsRiskFlag: number;
  countryRiskFlag: number;
}

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
  } = useForm<ClientFormData>({
    defaultValues: {
      age: 30,
      gender: "Male",
      numOfProducts: 1,
      isActiveMember: 1,
      country: "France",
      balance: 0,
      estimatedSalary: 0,
      tenure: 0,
      creditScore: 350,
      deltaBalance: 0,
      deltaNumOfProducts: 0,
      recentInactive: 0,
      productUsageDrop: 0,
      hadComplaint: 0,
    },
  });

  const onFormSubmit = useCallback(
    (data: ClientFormData) => {
      // Enviar datos crudos al backend (el backend computará las características derivadas)
      const modelData: ChurnPredictionRequest = {
        age: data.age,
        gender: data.gender,
        balance: data.balance,
        numOfProducts: data.numOfProducts,
        country: data.country,
        isActiveMember: data.isActiveMember,
        estimatedSalary: data.estimatedSalary,
        tenure: data.tenure,
        creditScore: data.creditScore,
        deltaBalance: data.deltaBalance,
        deltaNumOfProducts: data.deltaNumOfProducts,
        recentInactive: data.recentInactive === 1,
        productUsageDrop: data.productUsageDrop === 1,
        hadComplaint: data.hadComplaint === 1,
      };

      onSubmit(modelData);
    },
    [onSubmit],
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onFormSubmit)}
      sx={{ mt: { xs: 2, sm: 3 } }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: { xs: 4, sm: 8 },
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #e0e0e0",
          bgcolor: "background.paper",
          mb: { xs: 3, sm: 4 },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#000000",
            fontWeight: 600,
          }}
        >
          <Person sx={{ mr: 1, color: "#234567" }} aria-hidden="true" />
          Evaluación de Cliente Bancario
        </Typography>
        <Typography variant="body2" sx={{ color: "#424242" }}>
          Complete la información del cliente para evaluar el riesgo de abandono
        </Typography>
      </Paper>

      {/* Formulario con campos comprensibles */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2.5, sm: 4 },
          mb: { xs: 2, sm: 3 },
          border: "1px solid #e0e0e0",
          bgcolor: "background.paper",
          borderRadius: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", mb: { xs: 2, sm: 3 } }}
        >
          <Info
            sx={{ mr: 1, color: "#234567", fontSize: { xs: 18, sm: 20 } }}
            aria-hidden="true"
          />
          <Typography
            variant="h6"
            sx={{
              color: "#000000",
              fontWeight: 600,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            Información del Cliente
          </Typography>
        </Box>

        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: { xs: 2.5, sm: 3 },
          }}
        >
          {/* Edad */}
          <Box>
            <Controller
              name="age"
              control={control}
              rules={{
                required: "La edad es obligatoria",
                min: { value: 18, message: "La edad mínima es 18 años" },
                max: { value: 100, message: "La edad máxima es 100 años" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Edad del Cliente"
                  placeholder="Ej: 45"
                  error={!!errors.age}
                  helperText={
                    errors.age?.message || "Ingrese la edad del cliente"
                  }
                  InputProps={{
                    inputProps: { min: 18, max: 100 },
                  }}
                />
              )}
            />
          </Box>
          {/* Género */}
          <Box>
            <Controller
              name="gender"
              control={control}
              rules={{ required: "El género es obligatorio" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel>Género</InputLabel>
                  <Select {...field} label="Género">
                    <MenuItem value="Male">Masculino</MenuItem>
                    <MenuItem value="Female">Femenino</MenuItem>
                  </Select>
                  {errors.gender && (
                    <Typography variant="caption" color="error">
                      {errors.gender.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Box>
          {/* Número de productos */}
          <Box>
            <Controller
              name="numOfProducts"
              control={control}
              rules={{
                required: "El número de productos es obligatorio",
                min: { value: 1, message: "Mínimo 1 producto" },
                max: { value: 10, message: "Máximo 10 productos" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Productos Contratados"
                  placeholder="Ej: 2"
                  error={!!errors.numOfProducts}
                  helperText={
                    errors.numOfProducts?.message ||
                    "Cantidad de productos bancarios activos"
                  }
                  InputProps={{
                    inputProps: { min: 1, max: 10 },
                  }}
                />
              )}
            />
          </Box>
          {/* Estado de la cuenta */}
          <Box>
            <Controller
              name="isActiveMember"
              control={control}
              rules={{ required: "El estado de la cuenta es obligatorio" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.isActiveMember}>
                  <InputLabel>Estado de la Cuenta</InputLabel>
                  <Select {...field} label="Estado de la Cuenta">
                    <MenuItem value={1}>Activa</MenuItem>
                    <MenuItem value={0}>Inactiva</MenuItem>
                  </Select>
                  {errors.isActiveMember && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.isActiveMember.message}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1.5, color: "#666" }}
                  >
                    Indica si el cliente usa activamente sus servicios
                  </Typography>
                </FormControl>
              )}
            />
          </Box>
          {/* País */}
          <Box>
            <Controller
              name="country"
              control={control}
              rules={{ required: "El país es obligatorio" }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.country}>
                  <InputLabel>País de Residencia</InputLabel>
                  <Select {...field} label="País de Residencia">
                    <MenuItem value="France">Francia</MenuItem>
                    <MenuItem value="Germany">Alemania</MenuItem>
                    <MenuItem value="Spain">España</MenuItem>
                  </Select>
                  {errors.country && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 1.5 }}
                    >
                      {errors.country.message}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1.5, color: "#666" }}
                  >
                    Seleccione el país donde reside el cliente
                  </Typography>
                </FormControl>
              )}
            />
          </Box>
          {/* Balance */}
          <Box>
            <Controller
              name="balance"
              control={control}
              rules={{
                required: "El balance es obligatorio",
                min: { value: 0, message: "No puede ser negativo" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Balance en Cuenta ($)"
                  placeholder="Ej: 25000"
                  error={!!errors.balance}
                  helperText={
                    errors.balance?.message || "Saldo actual del cliente"
                  }
                  InputProps={{ inputProps: { min: 0 } }}
                />
              )}
            />
          </Box>
          {/* Estimated Salary */}
          <Box>
            <Controller
              name="estimatedSalary"
              control={control}
              rules={{
                required: "El salario estimado es obligatorio",
                min: { value: 0, message: "No puede ser negativo" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Salario Estimado ($)"
                  placeholder="Ej: 12000"
                  error={!!errors.estimatedSalary}
                  helperText={
                    errors.estimatedSalary?.message || "Salario anual estimado"
                  }
                  InputProps={{ inputProps: { min: 0 } }}
                />
              )}
            />
          </Box>
          {/* Tenure */}
          <Box>
            <Controller
              name="tenure"
              control={control}
              rules={{
                required: "La antigüedad es obligatoria",
                min: { value: 0, message: "No puede ser negativa" },
                max: { value: 10, message: "Máximo 10 años" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Antigüedad (años)"
                  placeholder="Ej: 5"
                  error={!!errors.tenure}
                  helperText={errors.tenure?.message || "Años como cliente"}
                  InputProps={{ inputProps: { min: 0, max: 10 } }}
                />
              )}
            />
          </Box>
          {/* Credit Score */}
          <Box>
            <Controller
              name="creditScore"
              control={control}
              rules={{
                required: "El score de crédito es obligatorio",
                min: { value: 300, message: "Mínimo 300" },
                max: { value: 850, message: "Máximo 850" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Score de Crédito"
                  placeholder="Ej: 720"
                  error={!!errors.creditScore}
                  helperText={
                    errors.creditScore?.message ||
                    "Score de crédito del cliente (300-850)"
                  }
                  InputProps={{ inputProps: { min: 300, max: 850 } }}
                />
              )}
            />
          </Box>
          {/* Variación de balance */}
          <Box>
            <Controller
              name="deltaBalance"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Cambio reciente en balance (%)"
                  placeholder="Ej: -15 (bajó 15%)"
                  helperText="Porcentaje de cambio en el saldo respecto al mes anterior"
                />
              )}
            />
          </Box>
          {/* Variación de productos */}
          <Box>
            <Controller
              name="deltaNumOfProducts"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  label="Cambio en productos contratados"
                  placeholder="Ej: -1 (canceló 1 producto)"
                  helperText="Número de productos ganados o perdidos recientemente"
                />
              )}
            />
          </Box>
          {/* ¿Pasó de activo a inactivo? */}
          <Box>
            <Controller
              name="recentInactive"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>¿Pasó de activo a inactivo?</InputLabel>
                  <Select {...field} label="¿Pasó de activo a inactivo?">
                    <MenuItem value={0}>No</MenuItem>
                    <MenuItem value={1}>Sí</MenuItem>
                  </Select>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1.5, color: "#666" }}
                  >
                    Indica si el cliente dejó de usar la cuenta recientemente
                  </Typography>
                </FormControl>
              )}
            />
          </Box>
          {/* ¿Dejó de usar algún producto? */}
          <Box>
            <Controller
              name="productUsageDrop"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>¿Dejó de usar algún producto?</InputLabel>
                  <Select {...field} label="¿Dejó de usar algún producto?">
                    <MenuItem value={0}>No</MenuItem>
                    <MenuItem value={1}>Sí</MenuItem>
                  </Select>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1.5, color: "#666" }}
                  >
                    Indica si el cliente dejó de usar algún producto bancario
                  </Typography>
                </FormControl>
              )}
            />
          </Box>
          {/* ¿Tuvo quejas recientes? */}
          <Box>
            <Controller
              name="hadComplaint"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>¿Tuvo quejas recientes?</InputLabel>
                  <Select {...field} label="¿Tuvo quejas recientes?">
                    <MenuItem value={0}>No</MenuItem>
                    <MenuItem value={1}>Sí</MenuItem>
                  </Select>
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, ml: 1.5, color: "#666" }}
                  >
                    Indica si el cliente presentó quejas o reclamos
                    recientemente
                  </Typography>
                </FormControl>
              )}
            />
          </Box>
        </Box>
      </Paper>

      {/* Botón de envío */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            px: { xs: 4, sm: 6 },
            py: { xs: 1.5, sm: 2 },
            bgcolor: "#234567",
            fontSize: { xs: "0.95rem", sm: "1rem" },
            fontWeight: 600,
            "&:hover": {
              bgcolor: "#4a5c6d",
            },
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "#9e9e9e",
            },
          }}
        >
          {loading ? "Analizando..." : "Evaluar Riesgo de Abandono"}
        </Button>
      </Box>
    </Box>
  );
};

export default PredictionForm;
