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

// Interfaz interna para el formulario (datos que ingresa el usuario)
interface ClientFormData {
  age: number;
  numOfProducts: number;
  isActiveMember: number;
  country: string;
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
      numOfProducts: 1,
      isActiveMember: 1,
      country: "France",
    },
  });

  const onFormSubmit = useCallback(
    (data: ClientFormData) => {
      // Transformar los datos del usuario a los parámetros del modelo
      const ageRisk = data.age >= 40 && data.age <= 70 ? 1 : 0;
      const inactivo4070 =
        data.age >= 40 && data.age <= 70 && data.isActiveMember === 0 ? 1 : 0;
      const productsRiskFlag = data.numOfProducts >= 3 ? 1 : 0;
      const countryRiskFlag = data.country === "Germany" ? 1 : 0;

      const modelData: ChurnFormData = {
        ageRisk,
        numOfProducts: data.numOfProducts,
        inactivo4070,
        productsRiskFlag,
        countryRiskFlag,
      };

      onSubmit(modelData);
    },
    [onSubmit]
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
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 2.5, sm: 3 },
          }}
        >
          {/* Edad */}
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

          {/* Número de productos */}
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

          {/* Estado de la cuenta */}
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

          {/* País */}
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
      </Paper>

      <Box
        sx={{
          mt: { xs: 3, sm: 4 },
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, sm: 0 },
        }}
      >
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            px: { xs: 4, sm: 6 },
            py: 1.5,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            minWidth: { xs: "100%", sm: 250 },
            maxWidth: { xs: "100%", sm: "none" },
            bgcolor: "#5a6c7d",
            color: "#ffffff",
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
