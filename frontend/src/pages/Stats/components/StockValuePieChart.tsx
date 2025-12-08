import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/utils/currency";

interface StockValueByCategory {
  categoryName: string;
  value: number;
}

interface StockValuePieChartProps {
  data: StockValueByCategory[];
  totalValue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function StockValuePieChart({ data, totalValue }: StockValuePieChartProps) {
  const chartData = data.slice(0, 8).map(item => ({
    name: item.categoryName,
    value: item.value
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-2 font-bold">
          Valor del Inventario por Categoría
        </Typography>
        <Typography variant="body2" className="mb-4 text-gray-600">
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
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

