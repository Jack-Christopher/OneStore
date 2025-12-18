import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getChartColors } from "@/utils/theme";
import type { MovementTypeFrequency } from "@/services/api/stats";

interface MovementTypesBarChartProps {
  data: MovementTypeFrequency[];
}

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  purchase: 'Compra',
  sale: 'Venta',
  adjustment_in: 'Ajuste Entrada',
  adjustment_out: 'Ajuste Salida',
  transfer_in: 'Transferencia Entrada',
  transfer_out: 'Transferencia Salida'
};

export default function MovementTypesBarChart({ data }: MovementTypesBarChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => ({
    name: MOVEMENT_TYPE_LABELS[item.movementType] || item.movementType,
    frecuencia: item.count,
    cantidad: item.totalQuantity
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Frecuencia de Tipos de Movimiento de Stock
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
            <YAxis yAxisId="left" stroke={colors.text} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.text} />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Bar yAxisId="left" dataKey="frecuencia" fill={colors.info} name="Frecuencia" />
            <Bar yAxisId="right" dataKey="cantidad" fill={colors.success} name="Cantidad Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

