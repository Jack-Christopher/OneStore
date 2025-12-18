import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";
import type { SalesByWarehouse } from "@/services/api/stats";

interface SalesByWarehouseBarChartProps {
  data: SalesByWarehouse[];
}

export default function SalesByWarehouseBarChart({ data }: SalesByWarehouseBarChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => ({
    name: item.warehouseName,
    ingresos: item.totalAmount,
    ventas: item.count
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Ingresos por Almacén
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="name" stroke={colors.text} />
            <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} stroke={colors.text} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.text} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "ingresos") {
                  return [formatCurrency(value), "Ingresos Totales"];
                }
                return [value, "Cantidad de Ventas"];
              }}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Bar yAxisId="left" dataKey="ingresos" fill={colors.info} name="Ingresos Totales" />
            <Bar yAxisId="right" dataKey="ventas" fill={colors.success} name="Cantidad de Ventas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

