import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";
import type { AverageTicketByDay } from "@/services/api/stats";

interface AverageTicketByDayLineChartProps {
  data: AverageTicketByDay[];
}

export default function AverageTicketByDayLineChart({ data }: AverageTicketByDayLineChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => ({
    date: item.date.split("-").reverse().join("/"),
    ticket: item.averageTicket,
    ventas: item.totalSales
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Ticket Promedio por Día
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="date" stroke={colors.text} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} stroke={colors.text} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Line 
              type="monotone" 
              dataKey="ticket" 
              stroke={colors.info} 
              name="Ticket Promedio"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

