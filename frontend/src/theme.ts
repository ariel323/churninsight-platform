import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#234567",
      light: "#e3e8ee",
      dark: "#1a2533",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#5a6c7d",
      light: "#f5f7fa",
      dark: "#3a4c5d",
      contrastText: "#ffffff",
    },
    success: {
      main: "#2e7d32",
      light: "#e6f4ea",
      dark: "#1b5e20",
    },
    error: {
      main: "#c62828",
      light: "#fbe9e7",
      dark: "#b71c1c",
    },
    warning: {
      main: "#d97706",
      light: "#fff8e1",
      dark: "#b45309",
    },
    background: {
      default: "#f7f9fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#4a5568",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      "@media (max-width:600px)": {
        fontSize: "1.75rem",
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: "2rem",
      "@media (max-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.5rem",
      "@media (max-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
      "@media (max-width:600px)": {
        fontSize: "1.1rem",
      },
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
      "@media (max-width:600px)": {
        fontSize: "0.95rem",
        lineHeight: 1.6,
      },
    },
    body2: {
      "@media (max-width:600px)": {
        fontSize: "0.875rem",
      },
    },
    caption: {
      "@media (max-width:600px)": {
        fontSize: "0.75rem",
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontSize: "1rem",
          fontWeight: 600,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          },
          "@media (max-width:600px)": {
            padding: "12px 20px",
            fontSize: "0.95rem",
            minHeight: "48px",
          },
        },
        sizeLarge: {
          padding: "12px 32px",
          fontSize: "1.1rem",
          "@media (max-width:600px)": {
            padding: "14px 24px",
            fontSize: "1rem",
            minHeight: "52px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover fieldset": {
              borderColor: "#1976d2",
            },
            "@media (max-width:600px)": {
              fontSize: "16px",
            },
          },
          "& .MuiOutlinedInput-input": {
            "@media (max-width:600px)": {
              padding: "14px 12px",
              fontSize: "16px",
            },
          },
          "& .MuiInputLabel-root": {
            "@media (max-width:600px)": {
              fontSize: "16px",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
        elevation3: {
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

export default theme;
