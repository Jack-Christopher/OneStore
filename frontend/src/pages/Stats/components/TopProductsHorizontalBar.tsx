import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { TopProduct } from "@/services/api/stats";

interface TopProductsHorizontalBarProps {
  data: TopProduct[];
  limit?: number;
}

export default function TopProductsHorizontalBar({ data, limit = 10 }: TopProductsHorizontalBarProps) {
  const chartData = data.slice(0, limit).reverse().map(item => ({
    name: item.productName.length > 20 ? `${item.productName.substring(0, 20)}...` : item.productName,
    cantidad: item.totalQuantity,
    monto: item.totalAmount
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Top {limit} Productos Más Vendidos
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => value.toString()} />
            <YAxis dataKey="name" type="category" width={90} />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === "monto") {
                  return [formatCurrency(value), "Monto Total"];
                }
                return [value, "Cantidad"];
              }}
            />
            <Legend />
            <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad Vendida" />
            <Bar dataKey="monto" fill="#82ca9d" name="Monto Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

