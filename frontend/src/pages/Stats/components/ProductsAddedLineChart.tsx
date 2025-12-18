import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getChartColors } from "@/utils/theme";

interface ProductsAddedByMonth {
  month: string;
  totalProducts: number;
}

interface ProductsAddedLineChartProps {
  data: ProductsAddedByMonth[];
}

export default function ProductsAddedLineChart({ data }: ProductsAddedLineChartProps) {
  const colors = getChartColors();
  const chartData = data.map(item => ({
    ...item,
    month: item.month.split("-").reverse().join("/")
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Productos Agregados por Mes
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis dataKey="month" stroke={colors.text} />
            <YAxis stroke={colors.text} />
            <Tooltip 
              contentStyle={{
                backgroundColor: colors.primary,
                border: `1px solid ${colors.grid}`,
                color: colors.text,
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalProducts" 
              stroke={colors.info} 
              name="Productos Agregados"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

