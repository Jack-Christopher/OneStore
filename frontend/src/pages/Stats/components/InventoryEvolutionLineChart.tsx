import { Card, CardContent, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { getChartColors } from "@/utils/theme";
import type { InventoryEvolution } from "@/services/api/stats";
import { getInventoryEvolution } from "@/services/api/stats";
import { useAuthStore } from "@/store/authStore";

interface InventoryEvolutionLineChartProps {
  productId?: string;
}

export default function InventoryEvolutionLineChart({ productId }: InventoryEvolutionLineChartProps) {
  const [data, setData] = useState<InventoryEvolution[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore.getState().authUser?.user;

  useEffect(() => {
    if (productId) {
      setLoading(true);
      const filters: any = {};
      if (user?.tenant_id && user?.role !== 'admin') {
        filters.tenant_id = user.tenant_id;
      }
      
      getInventoryEvolution(productId, filters)
        .then(res => {
          if (res.success && res.data) {
            setData(res.data);
          }
        })
        .catch(err => {
          console.error("Error fetching inventory evolution:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [productId, user?.tenant_id, user?.role]);

  const colors = getChartColors();

  if (!productId) {
    return (
      <Card className="bg-card">
        <CardContent>
          <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
            Evolución del Inventario por Producto
          </Typography>
          <Typography variant="body2" className="text-muted-foreground">
            Seleccione un producto para ver su evolución de inventario
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    date: item.date.split("-").reverse().join("/"),
    stock: item.stock,
    movement: item.movement
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Evolución del Inventario por Producto
        </Typography>
        {loading ? (
          <Typography variant="body2" className="text-muted-foreground">
            Cargando...
          </Typography>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="date" stroke={colors.text} />
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
                dataKey="stock" 
                stroke={colors.info} 
                name="Stock"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography variant="body2" className="text-muted-foreground">
            No hay datos de movimientos para este producto
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

