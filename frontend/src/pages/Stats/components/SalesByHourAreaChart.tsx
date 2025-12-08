import { Card, CardContent, Typography } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { SalesByHour } from "@/services/api/stats";

interface SalesByHourAreaChartProps {
  data: SalesByHour[];
}

export default function SalesByHourAreaChart({ data }: SalesByHourAreaChartProps) {
  // Ensure all 24 hours are represented
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const chartData = hours.map(hour => {
    const found = data.find(d => d.hour === hour);
    return {
      hour: `${hour}:00`,
      totalAmount: found?.totalAmount || 0,
      count: found?.count || 0
    };
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Ventas por Hora del Día
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
            <Area 
              type="monotone" 
              dataKey="totalAmount" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
              name="Monto Total"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

