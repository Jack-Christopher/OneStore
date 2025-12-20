import { Card, CardContent, Typography, IconButton, Box, Chip } from "@mui/material";
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
  const [maxCount, setMaxCount] = useState(0);

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
    let max = 0;

    // Process sales data
    salesByDate.forEach((item: ActivityByDate) => {
      const current = map.get(item.date) || { sales: 0, purchases: 0, operations: 0 };
      current.sales = item.count;
      map.set(item.date, current);
      if (item.count > max) max = item.count;
    });

    // Process purchases data
    purchasesByDate.forEach((item: ActivityByDate) => {
      const current = map.get(item.date) || { sales: 0, purchases: 0, operations: 0 };
      current.purchases = item.count;
      map.set(item.date, current);
      if (item.count > max) max = item.count;
    });

    // Process operations data
    operationsByDate.forEach((item: ActivityByDate) => {
      const current = map.get(item.date) || { sales: 0, purchases: 0, operations: 0 };
      current.operations = item.count;
      map.set(item.date, current);
      if (item.count > max) max = item.count;
    });

    setDataMap(map);
    setMaxCount(max);
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

  const getIntensity = (count: number) => {
    if (maxCount === 0 || count === 0) return 0;
    return Math.round((count / maxCount) * 100);
  };

  const getDayColor = (dateStr: string | null) => {
    if (!dateStr) return 'bg-gray-50';
    
    const data = dataMap.get(dateStr);
    if (!data) return 'bg-gray-50';

    const total = (data.sales || 0) + (data.purchases || 0) + (data.operations || 0);
    if (total === 0) return 'bg-gray-50';

    const intensity = getIntensity(total);
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 25) return 'bg-green-100';
    if (intensity < 50) return 'bg-yellow-100';
    if (intensity < 75) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getDayBorder = (dateStr: string | null) => {
    if (!dateStr) return '';
    
    const data = dataMap.get(dateStr);
    if (!data) return '';

    const borders = [];
    if (data.sales > 0) borders.push('border-l-2 border-green-500');
    if (data.purchases > 0) borders.push('border-t-2 border-blue-500');
    if (data.operations > 0) borders.push('border-r-2 border-purple-500');
    
    return borders.join(' ');
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

            return (
              <div
                key={day}
                className={`aspect-square p-1 border rounded ${getDayColor(dateStr)} ${getDayBorder(dateStr)} ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
                title={
                  data
                    ? `Ventas: ${data.sales || 0}, Compras: ${data.purchases || 0}, Operaciones: ${data.operations || 0}`
                    : 'Sin actividad'
                }
              >
                <div className="flex flex-col h-full">
                  <div className={`text-xs font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  {total > 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-xs font-bold text-gray-800">{total}</div>
                    </div>
                  )}
                  {data && (
                    <div className="flex gap-0.5 justify-center">
                      {data.sales > 0 && (
                        <div className="w-1 h-1 rounded-full bg-green-500" title={`${data.sales} ventas`} />
                      )}
                      {data.purchases > 0 && (
                        <div className="w-1 h-1 rounded-full bg-blue-500" title={`${data.purchases} compras`} />
                      )}
                      {data.operations > 0 && (
                        <div className="w-1 h-1 rounded-full bg-purple-500" title={`${data.operations} operaciones`} />
                      )}
                    </div>
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
              <div className="w-4 h-4 border-l-2 border-green-500 bg-white"></div>
              <span>Ventas</span>
            </div>
          )}
          {showPurchases && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-t-2 border-blue-500 bg-white"></div>
              <span>Compras</span>
            </div>
          )}
          {showOperations && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-r-2 border-purple-500 bg-white"></div>
              <span>Operaciones</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-blue-500 bg-white"></div>
            <span>Hoy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

