import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";

interface PurchasesByMonth {
  month: string;
  totalOrders: number;
  totalAmount: number;
}

interface PurchasesBarChartProps {
  data: PurchasesByMonth[];
}

export default function PurchasesBarChart({ data }: PurchasesBarChartProps) {
  const chartData = data.map(item => ({
    ...item,
    month: item.month.split("-").reverse().join("/")
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Compras por Mes
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "totalAmount") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Total Órdenes"];
              }}
            />
            <Legend />
            <Bar dataKey="totalOrders" fill="#8884d8" name="Total Órdenes" />
            <Bar dataKey="totalAmount" fill="#82ca9d" name="Monto Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

