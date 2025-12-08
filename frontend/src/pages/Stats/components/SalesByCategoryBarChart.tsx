import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { SalesByCategory } from "@/services/api/stats";

interface SalesByCategoryBarChartProps {
  data: SalesByCategory[];
}

export default function SalesByCategoryBarChart({ data }: SalesByCategoryBarChartProps) {
  const chartData = data.map(item => ({
    name: item.categoryName.length > 15 ? `${item.categoryName.substring(0, 15)}...` : item.categoryName,
    cantidad: item.totalQuantity,
    monto: item.totalAmount
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Cantidad de Productos Vendidos por Categoría
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "monto") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Cantidad"];
              }}
            />
            <Legend />
            <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad Vendida" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

