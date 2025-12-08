import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { PurchasesBySupplier } from "@/services/api/stats";

interface PurchasesBySupplierLineChartProps {
  data: PurchasesBySupplier[];
}

export default function PurchasesBySupplierLineChart({ data }: PurchasesBySupplierLineChartProps) {
  const chartData = data.map(item => ({
    name: item.supplierName.length > 15 ? `${item.supplierName.substring(0, 15)}...` : item.supplierName,
    monto: item.totalAmount,
    ordenes: item.orderCount
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Evolución de Compras por Proveedor
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
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
                return [value, "Órdenes"];
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="monto" 
              stroke="#8884d8" 
              name="Monto Total"
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="ordenes" 
              stroke="#82ca9d" 
              name="Cantidad de Órdenes"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

