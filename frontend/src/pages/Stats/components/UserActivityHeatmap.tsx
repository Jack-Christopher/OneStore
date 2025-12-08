import { Card, CardContent, Typography } from "@mui/material";
import { useAuthStore } from "@/store/authStore";
import { getUserActivity } from "@/services/api/stats";
import { useEffect, useState } from "react";
import type { UserActivity } from "@/services/api/stats";

interface UserActivityHeatmapProps {
  data: UserActivity[];
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function UserActivityHeatmap({ data }: UserActivityHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map());
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    const map = new Map<string, number>();
    let max = 0;

    data.forEach(item => {
      // MongoDB dayOfWeek: 1=Sunday, 7=Saturday
      // Convert to 0-6 for our array
      const dayIndex = item.dayOfWeek === 7 ? 0 : item.dayOfWeek;
      const key = `${dayIndex}-${item.hour}`;
      const current = map.get(key) || 0;
      const newValue = current + item.count;
      map.set(key, newValue);
      if (newValue > max) max = newValue;
    });

    setHeatmapData(map);
    setMaxCount(max);
  }, [data]);

  const getIntensity = (count: number) => {
    if (maxCount === 0) return 0;
    return Math.round((count / maxCount) * 100);
  };

  const getColorClass = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 25) return 'bg-green-200';
    if (intensity < 50) return 'bg-yellow-300';
    if (intensity < 75) return 'bg-orange-400';
    return 'bg-red-500 text-white';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold">
          Actividad por Usuario (Heatmap)
        </Typography>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left">Día/Hora</th>
                {Array.from({ length: 24 }, (_, i) => (
                  <th key={i} className="p-1 text-center w-8">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIndex) => (
                <tr key={dayIndex}>
                  <td className="p-2 font-medium">{day}</td>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const key = `${dayIndex}-${hour}`;
                    const count = heatmapData.get(key) || 0;
                    const intensity = getIntensity(count);
                    return (
                      <td
                        key={hour}
                        className={`p-1 text-center ${getColorClass(intensity)}`}
                        title={`${day} ${hour}:00 - ${count} movimientos`}
                      >
                        {count > 0 ? count : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border"></div>
            <span>Sin actividad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200"></div>
            <span>Baja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-300"></div>
            <span>Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400"></div>
            <span>Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>Muy Alta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

