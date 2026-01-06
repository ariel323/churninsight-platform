import React, { memo } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from "recharts";

interface ChartsSectionProps {
  barData: any[];
  pieData: any[];
  radarData: any[];
  trendData: any[];
}

const ChartsSection: React.FC<ChartsSectionProps> = memo(
  ({ barData, pieData, radarData, trendData }) => {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
        {/* Gráfico de Pie */}
        <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "320px" }}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Distribución del Riesgo
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart
                  role="img"
                  aria-label="Gráfico circular de distribución del riesgo"
                >
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value.toFixed(2)}%`, ""]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Gráfico de Barras */}
        <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "320px" }}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Probabilidad de Abandono
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  role="img"
                  aria-label="Gráfico de barras de probabilidad de abandono"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Radar Chart */}
        <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "320px" }}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Análisis Multidimensional
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  data={radarData}
                  role="img"
                  aria-label="Gráfico radar de análisis multidimensional"
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Puntuación"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Area Chart */}
        <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "320px" }}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📉 Tendencia Temporal
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={trendData}
                  role="img"
                  aria-label="Gráfico de área de tendencia temporal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }
);

ChartsSection.displayName = "ChartsSection";

export default ChartsSection;
