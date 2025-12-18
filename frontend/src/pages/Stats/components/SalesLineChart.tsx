import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartColors } from "@/utils/theme";

interface SalesData {
  month: string;
  totalSales: number;
  totalAmount: number;
}

interface SalesLineChartProps {
  data: SalesData[];
}

export default function SalesLineChart({ data }: SalesLineChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => {
    // Handle date format: YYYY-MM-DD or YYYY-MM
    let formattedMonth = item.month;
    if (item.month.includes("-")) {
      const parts = item.month.split("-");
      if (parts.length === 3) {
        // YYYY-MM-DD format (for daily data)
        formattedMonth = `${parts[2]}/${parts[1]}`;
      } else if (parts.length === 2) {
        // YYYY-MM format (for monthly data)
        formattedMonth = `${parts[1]}/${parts[0]}`;
      }
    }
    return {
      ...item,
      month: formattedMonth
    };
  });

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Ventas por Día
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="month" stroke={colors.text} />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              stroke={colors.text}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "totalAmount") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Total Ventas"];
              }}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
            <Line 
              type="monotone" 
              dataKey="totalSales" 
              stroke={colors.info} 
              name="Total Ventas"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="totalAmount" 
              stroke={colors.success} 
              name="Monto Total"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

