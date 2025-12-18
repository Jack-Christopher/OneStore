import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";
import type { SalesByCategory } from "@/services/api/stats";

interface SalesByCategoryBarChartProps {
  data: SalesByCategory[];
}

export default function SalesByCategoryBarChart({ data }: SalesByCategoryBarChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => ({
    name: item.categoryName.length > 15 ? `${item.categoryName.substring(0, 15)}...` : item.categoryName,
    cantidad: item.totalQuantity,
    monto: item.totalAmount
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Cantidad de Productos Vendidos por Categoría
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              stroke={colors.text}
            />
            <YAxis stroke={colors.text} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "monto") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Cantidad"];
              }}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Bar dataKey="cantidad" fill={colors.info} name="Cantidad Vendida" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

