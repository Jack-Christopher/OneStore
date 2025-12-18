import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getChartColors } from "@/utils/theme";
import type { ProductsAddedByMonth } from "@/services/api/stats";

interface ProductsGrowthStepLineChartProps {
  data: ProductsAddedByMonth[];
}

export default function ProductsGrowthStepLineChart({ data }: ProductsGrowthStepLineChartProps) {
  const colors = getChartColors();
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
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Crecimiento de Nuevos Productos
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="month" stroke={colors.text} />
            <YAxis stroke={colors.text} />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Line 
              type="stepAfter" 
              dataKey="nuevos" 
              stroke={colors.info} 
              name="Nuevos por Mes"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="acumulado" 
              stroke={colors.success} 
              name="Total Acumulado"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

