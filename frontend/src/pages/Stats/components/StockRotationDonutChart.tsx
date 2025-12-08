import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { StockValue } from "@/services/api/stats";

interface StockRotationDonutChartProps {
  stockRotation: number;
  totalStockValue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function StockRotationDonutChart({ stockRotation, totalStockValue }: StockRotationDonutChartProps) {
  // Calculate rotation percentages
  const rotationValue = totalStockValue * stockRotation;
  const remainingValue = totalStockValue - rotationValue;

  const chartData = [
    { name: 'Stock que Rota', value: rotationValue },
    { name: 'Stock Estático', value: Math.max(0, remainingValue) }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-2 font-bold">
          Rotación de Inventario
        </Typography>
        <Typography variant="body2" className="mb-4 text-gray-600">
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
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

