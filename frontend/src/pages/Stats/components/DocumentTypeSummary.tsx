import { useEffect, useState } from "react";
import api from "@/services/lib/axios";
import { formatCurrency } from "@/utils/currency";

interface MonthCell {
  month: string;
  count: number;
  total: number;
}

interface DocumentTypeRow {
  type: string;
  label: string;
  count: number;
  total: number;
  months: MonthCell[];
}

interface Summary {
  months: string[];
  types: DocumentTypeRow[];
}

export default function DocumentTypeSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api.get("/api/stats/billing/document-summary")
      .then((res) => {
        if (res.data?.success) setSummary(res.data.data);
      })
      .catch((error) => {
        console.error("Error fetching document summary:", error);
      });
  }, []);

  if (!summary) return null;

  return (
    <section className="mb-6 border border-border bg-card p-4">
      <h2 className="text-lg font-semibold mb-3">Comprobantes por tipo</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3">Tipo</th>
              {summary.months.map((month) => (
                <th key={month} className="py-2 pr-3">{month}</th>
              ))}
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {summary.types.map((row) => (
              <tr key={row.type} className="border-b border-border">
                <td className="py-2 pr-3">{row.label}</td>
                {row.months.map((cell) => (
                  <td key={cell.month} className="py-2 pr-3">
                    {cell.count} · {formatCurrency(cell.total)}
                  </td>
                ))}
                <td className="py-2">{row.count} · {formatCurrency(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
