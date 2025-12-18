import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getChartPalette, getChartColors } from "@/utils/theme";
import type { StockValue } from "@/services/api/stats";

interface StockRotationDonutChartProps {
  stockRotation: number;
  totalStockValue: number;
}

export default function StockRotationDonutChart({ stockRotation, totalStockValue }: StockRotationDonutChartProps) {
  const colors = getChartColors();
  const palette = getChartPalette();
  // Calculate rotation percentages
  const rotationValue = totalStockValue * stockRotation;
  const remainingValue = totalStockValue - rotationValue;

  const chartData = [
    { name: 'Stock que Rota', value: rotationValue },
    { name: 'Stock Estático', value: Math.max(0, remainingValue) }
  ];

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-2 font-bold text-card-foreground">
          Rotación de Inventario
        </Typography>
        <Typography variant="body2" className="mb-4 text-muted-foreground">
          Rotación: {stockRotation.toFixed(2)}x por año
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              innerRadius={60}
              fill={colors.info}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

