import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";
import type { TopCustomer } from "@/services/api/stats";

interface TopCustomersBarChartProps {
  data: TopCustomer[];
  limit?: number;
}

export default function TopCustomersBarChart({ data, limit = 10 }: TopCustomersBarChartProps) {
  const colors = getChartColors();
  const chartData = data.slice(0, limit).map(item => ({
    name: item.customerName.length > 20 ? `${item.customerName.substring(0, 20)}...` : item.customerName,
    compras: item.purchaseCount,
    monto: item.totalAmount
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Top {limit} Clientes Recurrentes
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
            <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} stroke={colors.text} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.text} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "monto") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Compras"];
              }}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Bar yAxisId="left" dataKey="monto" fill={colors.info} name="Monto Total" />
            <Bar yAxisId="right" dataKey="compras" fill={colors.success} name="Cantidad de Compras" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

