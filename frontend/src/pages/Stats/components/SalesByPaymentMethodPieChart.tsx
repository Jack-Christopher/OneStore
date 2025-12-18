import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartPalette, getChartColors } from "@/utils/theme";
import type { SalesByPaymentMethod } from "@/services/api/stats";

interface SalesByPaymentMethodPieChartProps {
  data: SalesByPaymentMethod[];
}

export default function SalesByPaymentMethodPieChart({ data }: SalesByPaymentMethodPieChartProps) {
  const colors = getChartColors();
  const palette = getChartPalette();
  const chartData = data.map(item => ({
    name: item.paymentMethod || 'No especificado',
    value: item.totalAmount,
    count: item.count
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Ventas por Método de Pago
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill={colors.info}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                formatCurrency(value),
                `${props.payload.name} (${props.payload.count} ventas)`
              ]}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

