import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/utils/currency";
import { getChartPalette, getChartColors } from "@/utils/theme";

interface StockValueByCategory {
  categoryName: string;
  value: number;
}

interface StockValuePieChartProps {
  data: StockValueByCategory[];
  totalValue: number;
}

export default function StockValuePieChart({ data, totalValue }: StockValuePieChartProps) {
  const colors = getChartColors();
  const palette = getChartPalette();
  const chartData = data.slice(0, 8).map(item => ({
    name: item.categoryName,
    value: item.value
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-2 font-bold text-card-foreground">
          Valor del Inventario por Categoría
        </Typography>
        <Typography variant="body2" className="mb-4 text-muted-foreground">
          Total: {formatCurrency(totalValue)}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill={colors.info}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Legend wrapperStyle={{ color: colors.text }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

