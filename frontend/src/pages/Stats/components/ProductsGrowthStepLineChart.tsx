import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ProductsAddedByMonth } from "@/services/api/stats";

interface ProductsGrowthStepLineChartProps {
  data: ProductsAddedByMonth[];
}

export default function ProductsGrowthStepLineChart({ data }: ProductsGrowthStepLineChartProps) {
  let cumulative = 0;
  const chartData = data.map(item => {
    cumulative += item.totalProducts;
    return {
      month: item.month.split("-").reverse().join("/"),
      nuevos: item.totalProducts,
      acumulado: cumulative
    };
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Crecimiento de Nuevos Productos
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="stepAfter" 
              dataKey="nuevos" 
              stroke="#8884d8" 
              name="Nuevos por Mes"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="acumulado" 
              stroke="#82ca9d" 
              name="Total Acumulado"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

