import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
  const chartData = data.map(item => ({
    name: MOVEMENT_TYPE_LABELS[item.movementType] || item.movementType,
    frecuencia: item.count,
    cantidad: item.totalQuantity
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Frecuencia de Tipos de Movimiento de Stock
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
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="frecuencia" fill="#8884d8" name="Frecuencia" />
            <Bar yAxisId="right" dataKey="cantidad" fill="#82ca9d" name="Cantidad Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

