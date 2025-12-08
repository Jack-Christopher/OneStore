import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { SalesByMonth } from "@/services/api/stats";
import type { PurchasesByMonth } from "@/services/api/stats";

interface MonthComparisonGroupedBarProps {
  salesData: SalesByMonth[];
  purchasesData?: PurchasesByMonth[];
  currentMonth: string;
  lastMonth: string;
  currentSalesAmount: number;
  lastSalesAmount: number;
  currentSalesCount: number;
  lastSalesCount: number;
  currentAverageTicket: number;
  lastAverageTicket: number;
}

export default function MonthComparisonGroupedBar({
  currentSalesAmount,
  lastSalesAmount,
  currentSalesCount,
  lastSalesCount,
  currentAverageTicket,
  lastAverageTicket,
  currentMonth,
  lastMonth
}: MonthComparisonGroupedBarProps) {
  const chartData = [
    {
      month: currentMonth,
      ventas: currentSalesAmount,
      cantidad: currentSalesCount,
      ticketPromedio: currentAverageTicket
    },
    {
      month: lastMonth,
      ventas: lastSalesAmount,
      cantidad: lastSalesCount,
      ticketPromedio: lastAverageTicket
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Comparativa Mes vs Mes Pasado
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "ventas" || name === "ticketPromedio") {
                  return [formatCurrency(value), name === "ventas" ? "Ventas Totales" : "Ticket Promedio"];
                }
                return [value, "Cantidad de Ventas"];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="ventas" fill="#8884d8" name="Ventas Totales" />
            <Bar yAxisId="right" dataKey="cantidad" fill="#82ca9d" name="Cantidad de Ventas" />
            <Bar yAxisId="left" dataKey="ticketPromedio" fill="#ffc658" name="Ticket Promedio" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

