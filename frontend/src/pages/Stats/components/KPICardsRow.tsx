import { Card, CardContent, Typography, Box } from "@mui/material";
import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown, Users, BarChart3, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";

interface KPICardsRowProps {
  // Ventas
  totalSalesAmount: number;
  totalSalesCount: number;
  averageTicket: number;
  comparisonVsLastMonth: number;

  // Compras
  totalPurchasesAmount: number;
  averageCostPerDay: number;

  // Stock
  stockValue: number;
  stockRotation: number;

  // Productos
  newProductsMonth: number;
  productsActive: number;
  productsInactive: number;

  // Usuarios
  activeEmployees: number;
  newEmployeesMonth: number;
}

export default function KPICardsRow({
  totalSalesAmount,
  totalSalesCount,
  averageTicket,
  comparisonVsLastMonth,
  totalPurchasesAmount,
  averageCostPerDay,
  stockValue,
  stockRotation,
  newProductsMonth,
  productsActive,
  productsInactive,
  activeEmployees,
  newEmployeesMonth
}: KPICardsRowProps) {
  const isPositive = comparisonVsLastMonth >= 0;

  return (
    <div className="space-y-6">
      {/* Ventas Section */}
      <Box>
        <Typography variant="h6" className="mb-4 font-bold text-foreground">
          Ventas
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Total Ventas
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {formatCurrency(totalSalesAmount)}
                  </Typography>
                </div>
                <DollarSign size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Cantidad de Ventas
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {totalSalesCount}
                  </Typography>
                </div>
                <BarChart3 size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent text-accent-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Ticket Promedio
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {formatCurrency(averageTicket)}
                  </Typography>
                </div>
                <DollarSign size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${isPositive ? 'bg-secondary' : 'bg-accent'} ${isPositive ? 'text-secondary-foreground' : 'text-accent-foreground'}`}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Comparación Mes
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {isPositive ? "+" : ""}{comparisonVsLastMonth.toFixed(1)}%
                  </Typography>
                  <div className="flex items-center gap-1 mt-1">
                    {isPositive ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <Typography variant="caption" className="opacity-90">
                      vs mes anterior
                    </Typography>
                  </div>
                </div>
                {isPositive ? (
                  <TrendingUp size={40} className="opacity-80" />
                ) : (
                  <TrendingDown size={40} className="opacity-80" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Box>

      {/* Compras Section */}
      <Box>
        <Typography variant="h6" className="mb-4 font-bold text-foreground">
          Compras
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Costo Total Adquirido
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {formatCurrency(totalPurchasesAmount)}
                  </Typography>
                  <Typography variant="caption" className="opacity-90">
                    Este mes
                  </Typography>
                </div>
                <ShoppingCart size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Costo Promedio por Día
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {formatCurrency(averageCostPerDay)}
                  </Typography>
                </div>
                <BarChart3 size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Box>

      {/* Stock Section */}
      <Box>
        <Typography variant="h6" className="mb-4 font-bold text-foreground">
          Stock
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Valoración del Stock Total
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {formatCurrency(stockValue)}
                  </Typography>
                </div>
                <Package size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Rotación Aproximada
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {stockRotation.toFixed(2)}x
                  </Typography>
                  <Typography variant="caption" className="opacity-90">
                    Veces por año
                  </Typography>
                </div>
                <BarChart3 size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Box>

      {/* Productos Section */}
      <Box>
        <Typography variant="h6" className="mb-4 font-bold text-foreground">
          Productos
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Nuevos Productos
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {newProductsMonth}
                  </Typography>
                  <Typography variant="caption" className="opacity-90">
                    Este mes
                  </Typography>
                </div>
                <Package size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Productos Activos
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {productsActive}
                  </Typography>
                </div>
                <Package size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-accent text-accent-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Productos Inactivos
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {productsInactive}
                  </Typography>
                </div>
                <AlertTriangle size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Box>

      {/* Usuarios Section */}
      <Box>
        <Typography variant="h6" className="mb-4 font-bold text-foreground">
          Usuarios
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Empleados Activos
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {activeEmployees}
                  </Typography>
                </div>
                <Users size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary text-secondary-foreground">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="opacity-90">
                    Nuevos Empleados
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {newEmployeesMonth}
                  </Typography>
                  <Typography variant="caption" className="opacity-90">
                    Este mes
                  </Typography>
                </div>
                <Users size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Box>
    </div>
  );
}
