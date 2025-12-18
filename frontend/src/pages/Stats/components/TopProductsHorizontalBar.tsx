import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";
import type { TopProduct } from "@/services/api/stats";

interface TopProductsHorizontalBarProps {
  data: TopProduct[];
  limit?: number;
}

export default function TopProductsHorizontalBar({ data, limit = 10 }: TopProductsHorizontalBarProps) {
  const colors = getChartColors();
  const chartData = data.slice(0, limit).reverse().map(item => ({
    name: item.productName.length > 20 ? `${item.productName.substring(0, 20)}...` : item.productName,
    cantidad: item.totalQuantity,
    monto: item.totalAmount
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Top {limit} Productos Más Vendidos
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis type="number" tickFormatter={(value) => value.toString()} stroke={colors.text} />
            <YAxis dataKey="name" type="category" width={90} stroke={colors.text} />
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
            <Bar dataKey="monto" fill={colors.success} name="Monto Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

