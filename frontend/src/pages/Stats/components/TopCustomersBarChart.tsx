import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { TopCustomer } from "@/services/api/stats";

interface TopCustomersBarChartProps {
  data: TopCustomer[];
  limit?: number;
}

export default function TopCustomersBarChart({ data, limit = 10 }: TopCustomersBarChartProps) {
  const chartData = data.slice(0, limit).map(item => ({
    name: item.customerName.length > 20 ? `${item.customerName.substring(0, 20)}...` : item.customerName,
    compras: item.purchaseCount,
    monto: item.totalAmount
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Top {limit} Clientes Recurrentes
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
            <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "monto") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Compras"];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="monto" fill="#8884d8" name="Monto Total" />
            <Bar yAxisId="right" dataKey="compras" fill="#82ca9d" name="Cantidad de Compras" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

