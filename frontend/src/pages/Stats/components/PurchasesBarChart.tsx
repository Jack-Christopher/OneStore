import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";

interface PurchasesByMonth {
  month: string;
  totalOrders: number;
  totalAmount: number;
}

interface PurchasesBarChartProps {
  data: PurchasesByMonth[];
}

export default function PurchasesBarChart({ data }: PurchasesBarChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => ({
    ...item,
    month: item.month.split("-").reverse().join("/")
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Compras por Mes
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="month" stroke={colors.text} />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              stroke={colors.text}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "totalAmount") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Total Órdenes"];
              }}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Bar dataKey="totalOrders" fill={colors.info} name="Total Órdenes" />
            <Bar dataKey="totalAmount" fill={colors.success} name="Monto Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

