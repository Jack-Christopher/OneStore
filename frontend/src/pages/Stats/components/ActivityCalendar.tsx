import { Card, CardContent, Typography, IconButton, Box, Popover } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useStatsStore } from "@/store/statsStore";
import type { ActivityByDate } from "@/services/api/stats";

interface ActivityCalendarProps {
  showSales?: boolean;
  showPurchases?: boolean;
  showOperations?: boolean;
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function ActivityCalendar({
  showSales = true,
  showPurchases = true,
  showOperations = true
}: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dataMap, setDataMap] = useState<Map<string, { sales: number; purchases: number; operations: number }>>(new Map());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedData, setSelectedData] = useState<{ sales: number; purchases: number; operations: number } | null>(null);

  const { salesByDate, purchasesByDate, operationsByDate, fetchSalesByDate, fetchPurchasesByDate, fetchOperationsByDate } = useStatsStore();

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const filters = {
      date_from: firstDay.toISOString().split('T')[0],
      date_to: lastDay.toISOString().split('T')[0]
    };

    if (showSales) fetchSalesByDate(filters);
    if (showPurchases) fetchPurchasesByDate(filters);
    if (showOperations) fetchOperationsByDate(filters);
  }, [currentDate, showSales, showPurchases, showOperations, fetchSalesByDate, fetchPurchasesByDate, fetchOperationsByDate]);

  useEffect(() => {
    const map = new Map<string, { sales: number; purchases: number; operations: number }>();

    // Process sales data
    salesByDate.forEach((item: ActivityByDate) => {
      const current = map.get(item.date) || { sales: 0, purchases: 0, operations: 0 };
      current.sales = item.count;
      map.set(item.date, current);
    });

    // Process purchases data
    purchasesByDate.forEach((item: ActivityByDate) => {
      const current = map.get(item.date) || { sales: 0, purchases: 0, operations: 0 };
      current.purchases = item.count;
      map.set(item.date, current);
    });

    // Process operations data
    operationsByDate.forEach((item: ActivityByDate) => {
      const current = map.get(item.date) || { sales: 0, purchases: 0, operations: 0 };
      current.operations = item.count;
      map.set(item.date, current);
    });

    setDataMap(map);
  }, [salesByDate, purchasesByDate, operationsByDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDayClick = (event: React.MouseEvent<HTMLElement>, dateStr: string, data: { sales: number; purchases: number; operations: number } | undefined) => {
    if (data) {
      setSelectedDate(dateStr);
      setSelectedData(data);
      setAnchorEl(event.currentTarget);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedDate(null);
    setSelectedData(null);
  };

  const getProportionalBars = (data: { sales: number; purchases: number; operations: number }) => {
    const total = (data.sales || 0) + (data.purchases || 0) + (data.operations || 0);
    if (total === 0) return null;

    const salesPercent = ((data.sales || 0) / total) * 100;
    const purchasesPercent = ((data.purchases || 0) / total) * 100;
    const operationsPercent = ((data.operations || 0) / total) * 100;

    return (
      <div className="flex h-1 w-full rounded overflow-hidden">
        {data.sales > 0 && (
          <div
            className="bg-green-500"
            style={{ width: `${salesPercent}%` }}
            title={`${data.sales} ventas`}
          />
        )}
        {data.purchases > 0 && (
          <div
            className="bg-blue-500"
            style={{ width: `${purchasesPercent}%` }}
            title={`${data.purchases} compras`}
          />
        )}
        {data.operations > 0 && (
          <div
            className="bg-purple-500"
            style={{ width: `${operationsPercent}%` }}
            title={`${data.operations} operaciones`}
          />
        )}
      </div>
    );
  };

  const getActivityBadges = (data: { sales: number; purchases: number; operations: number }) => {
    const badges = [];

    if (showSales && data.sales > 0) {
      badges.push(
        <span
          key="sales"
          className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-semibold bg-green-100 text-green-800 border border-green-300"
          title={`${data.sales} ventas`}
        >
          {data.sales}V
        </span>
      );
    }

    if (showPurchases && data.purchases > 0) {
      badges.push(
        <span
          key="purchases"
          className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-semibold bg-blue-100 text-blue-800 border border-blue-300"
          title={`${data.purchases} compras`}
        >
          {data.purchases}C
        </span>
      );
    }

    if (showOperations && data.operations > 0) {
      badges.push(
        <span
          key="operations"
          className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-semibold bg-purple-100 text-purple-800 border border-purple-300"
          title={`${data.operations} operaciones`}
        >
          {data.operations}O
        </span>
      );
    }

    return badges;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const monthName = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <Card className="bg-card">
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="font-bold text-card-foreground">
            Calendario de Actividad
          </Typography>
          <div className="flex items-center gap-2">
            <IconButton onClick={previousMonth} size="small" className="text-card-foreground">
              <ChevronLeft />
            </IconButton>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-card-foreground hover:bg-gray-100 rounded"
            >
              {monthName} {year}
            </button>
            <IconButton onClick={nextMonth} size="small" className="text-card-foreground">
              <ChevronRight />
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = getDateString(day);
            const data = dataMap.get(dateStr);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            const total = data ? (data.sales || 0) + (data.purchases || 0) + (data.operations || 0) : 0;
            const hasActivity = total > 0;

            return (
              <div
                key={day}
                onClick={(e) => hasActivity && handleDayClick(e, dateStr, data)}
                className={`aspect-square p-1 border rounded bg-gray-50 cursor-${hasActivity ? 'pointer hover:bg-gray-100' : 'default'} ${isToday ? 'ring-2 ring-blue-500' : ''
                  } transition-colors`}
                title={
                  data
                    ? `Click para ver detalles: Ventas: ${data.sales || 0}, Compras: ${data.purchases || 0}, Operaciones: ${data.operations || 0}`
                    : 'Sin actividad'
                }
              >
                <div className="flex flex-col h-full">
                  <div className={`text-xs font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {day}
                  </div>

                  {hasActivity && data && (
                    <>
                      {/* Badges con colores */}
                      <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                        {getActivityBadges(data)}
                      </div>

                      {/* Barras horizontales proporcionales */}
                      <div className="mt-auto pt-0.5">
                        {getProportionalBars(data)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border rounded"></div>
            <span>Sin actividad</span>
          </div>
          {showSales && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800 border border-green-300">
                V
              </span>
              <span>Ventas</span>
            </div>
          )}
          {showPurchases && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                C
              </span>
              <span>Compras</span>
            </div>
          )}
          {showOperations && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                O
              </span>
              <span>Operaciones</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-blue-500 bg-white"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-[10px]">Click en un día con actividad para ver detalles</span>
          </div>
        </div>

        {/* Popover con información detallada */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box className="p-4 min-w-[250px]">
            <Typography variant="h6" className="mb-3 font-bold text-card-foreground">
              Actividad del {selectedDate && new Date(selectedDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>

            {selectedData && (
              <div className="space-y-3">
                {showSales && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium text-sm">Ventas</span>
                    </div>
                    <span className="font-bold text-green-700">{selectedData.sales || 0}</span>
                  </div>
                )}

                {showPurchases && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium text-sm">Compras</span>
                    </div>
                    <span className="font-bold text-blue-700">{selectedData.purchases || 0}</span>
                  </div>
                )}

                {showOperations && (
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="font-medium text-sm">Operaciones</span>
                    </div>
                    <span className="font-bold text-purple-700">{selectedData.operations || 0}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Total</span>
                    <span className="font-bold text-lg text-gray-800">
                      {(selectedData.sales || 0) + (selectedData.purchases || 0) + (selectedData.operations || 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Box>
        </Popover>
      </CardContent>
    </Card>
  );
}

