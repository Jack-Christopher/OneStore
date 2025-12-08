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
        <Typography variant="h6" className="mb-4 font-bold text-gray-700">
          Ventas
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-blue-100">
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

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-green-100">
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

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-purple-100">
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

          <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-cyan-100">
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
                    <Typography variant="caption" className="text-cyan-100">
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
        <Typography variant="h6" className="mb-4 font-bold text-gray-700">
          Compras
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-orange-100">
                    Costo Total Adquirido
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {formatCurrency(totalPurchasesAmount)}
                  </Typography>
                  <Typography variant="caption" className="text-orange-100">
                    Este mes
                  </Typography>
                </div>
                <ShoppingCart size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-amber-100">
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
        <Typography variant="h6" className="mb-4 font-bold text-gray-700">
          Stock
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-indigo-100">
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

          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-teal-100">
                    Rotación Aproximada
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {stockRotation.toFixed(2)}x
                  </Typography>
                  <Typography variant="caption" className="text-teal-100">
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
        <Typography variant="h6" className="mb-4 font-bold text-gray-700">
          Productos
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-pink-100">
                    Nuevos Productos
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {newProductsMonth}
                  </Typography>
                  <Typography variant="caption" className="text-pink-100">
                    Este mes
                  </Typography>
                </div>
                <Package size={40} className="opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-emerald-100">
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

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-red-100">
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
        <Typography variant="h6" className="mb-4 font-bold text-gray-700">
          Usuarios
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-violet-500 to-violet-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-violet-100">
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

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="subtitle2" className="text-blue-100">
                    Nuevos Empleados
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {newEmployeesMonth}
                  </Typography>
                  <Typography variant="caption" className="text-blue-100">
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
