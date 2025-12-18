import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";
import type { PurchasesBySupplier } from "@/services/api/stats";

interface PurchasesBySupplierLineChartProps {
  data: PurchasesBySupplier[];
}

export default function PurchasesBySupplierLineChart({ data }: PurchasesBySupplierLineChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => ({
    name: item.supplierName.length > 15 ? `${item.supplierName.substring(0, 15)}...` : item.supplierName,
    monto: item.totalAmount,
    ordenes: item.orderCount
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Evolución de Compras por Proveedor
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
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
                return [value, "Órdenes"];
              }}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="monto" 
              stroke={colors.info} 
              name="Monto Total"
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="ordenes" 
              stroke={colors.success} 
              name="Cantidad de Órdenes"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

