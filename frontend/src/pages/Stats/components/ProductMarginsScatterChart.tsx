import { Card, CardContent, Typography } from "@mui/material";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/utils/currency";
import type { ProductMargin } from "@/services/api/stats";

interface ProductMarginsScatterChartProps {
  data: ProductMargin[];
  limit?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductMarginsScatterChart({ data, limit = 50 }: ProductMarginsScatterChartProps) {
  const chartData = data.slice(0, limit).map(item => ({
    x: item.purchasePrice,
    y: item.salePrice,
    name: item.productName,
    margin: item.margin,
    marginPercent: item.marginPercent
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Margen Bruto por Producto
        </Typography>
        <Typography variant="body2" className="mb-2 text-gray-600">
          Eje X: Precio de Compra | Eje Y: Precio de Venta
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Precio Compra"
              tickFormatter={(value) => formatCurrency(value)}
              label={{ value: 'Precio de Compra', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Precio Venta"
              tickFormatter={(value) => formatCurrency(value)}
              label={{ value: 'Precio de Venta', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number, name: string) => {
                if (name === 'y') return [formatCurrency(value), 'Precio Venta'];
                if (name === 'x') return [formatCurrency(value), 'Precio Compra'];
                return [value, name];
              }}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            />
            <Scatter name="Productos" data={chartData} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

