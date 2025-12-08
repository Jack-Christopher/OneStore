import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProductsAddedByMonth {
  month: string;
  totalProducts: number;
}

interface ProductsAddedLineChartProps {
  data: ProductsAddedByMonth[];
}

export default function ProductsAddedLineChart({ data }: ProductsAddedLineChartProps) {
  const chartData = data.map(item => ({
    ...item,
    month: item.month.split("-").reverse().join("/")
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Productos Agregados por Mes
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="totalProducts" 
              stroke="#8884d8" 
              name="Productos Agregados"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

