import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { SalesByWarehouse } from "@/services/api/stats";

interface SalesByWarehouseBarChartProps {
  data: SalesByWarehouse[];
}

export default function SalesByWarehouseBarChart({ data }: SalesByWarehouseBarChartProps) {
  const chartData = data.map(item => ({
    name: item.warehouseName,
    ingresos: item.totalAmount,
    ventas: item.count
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Ingresos por Almacén
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "ingresos") {
                  return [formatCurrency(value), "Ingresos Totales"];
                }
                return [value, "Cantidad de Ventas"];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="ingresos" fill="#8884d8" name="Ingresos Totales" />
            <Bar yAxisId="right" dataKey="ventas" fill="#82ca9d" name="Cantidad de Ventas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

