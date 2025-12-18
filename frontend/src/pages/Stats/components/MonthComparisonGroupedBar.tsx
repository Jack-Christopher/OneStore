import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";
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
  const colors = getChartColors();
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
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Comparativa Mes vs Mes Pasado
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="month" stroke={colors.text} />
            <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} stroke={colors.text} />
            <YAxis yAxisId="right" orientation="right" stroke={colors.text} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "ventas" || name === "ticketPromedio") {
                  return [formatCurrency(value), name === "ventas" ? "Ventas Totales" : "Ticket Promedio"];
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
            <Bar yAxisId="left" dataKey="ventas" fill={colors.info} name="Ventas Totales" />
            <Bar yAxisId="right" dataKey="cantidad" fill={colors.success} name="Cantidad de Ventas" />
            <Bar yAxisId="left" dataKey="ticketPromedio" fill={colors.warning} name="Ticket Promedio" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

