import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { AverageTicketByDay } from "@/services/api/stats";

interface AverageTicketByDayLineChartProps {
  data: AverageTicketByDay[];
}

export default function AverageTicketByDayLineChart({ data }: AverageTicketByDayLineChartProps) {
  const chartData = data.map(item => ({
    date: item.date.split("-").reverse().join("/"),
    ticket: item.averageTicket,
    ventas: item.totalSales
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Ticket Promedio por Día
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
            <Line 
              type="monotone" 
              dataKey="ticket" 
              stroke="#8884d8" 
              name="Ticket Promedio"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

