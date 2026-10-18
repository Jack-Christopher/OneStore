export { };
const Invoice = require("../../database/models/Invoice");
const SaleTicket = require("../../database/models/SaleTicket");
const CreditNote = require("../../database/models/CreditNote");
const DebitNote = require("../../database/models/DebitNote");

const DOCUMENT_TYPES = [
  { type: "invoice", label: "Factura", model: Invoice },
  { type: "sale_ticket", label: "Boleta", model: SaleTicket },
  { type: "credit_note", label: "Nota de crédito", model: CreditNote },
  { type: "debit_note", label: "Nota de débito", model: DebitNote }
];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function recentMonths(count: number) {
  const months: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    months.push(monthKey(date));
  }
  return months;
}

async function getDocumentSummary(tenantId: string) {
  const months = recentMonths(6);
  const from = new Date(`${months[0]}-01T00:00:00`);

  const types = [];
  for (const entry of DOCUMENT_TYPES) {
    const grouped = await entry.model.aggregate([
      {
        $match: {
          tenant_id: tenantId,
          anulado: { $ne: "SI" }
        }
      },
      {
        $addFields: {
          issued_at: { $ifNull: ["$fecha_emision", "$created_at"] }
        }
      },
      { $match: { issued_at: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$issued_at" } },
          count: { $sum: 1 },
          total: { $sum: { $ifNull: ["$total", 0] } }
        }
      }
    ]);

    const byMonth = new Map(grouped.map((row: any) => [row._id, row]));
    const monthRows = months.map((month) => {
      const row = byMonth.get(month) as { count?: number; total?: number } | undefined;
      return {
        month,
        count: row?.count || 0,
        total: row?.total || 0
      };
    });

    types.push({
      type: entry.type,
      label: entry.label,
      count: monthRows.reduce((sum, row) => sum + row.count, 0),
      total: monthRows.reduce((sum, row) => sum + row.total, 0),
      months: monthRows
    });
  }

  return { months, types };
}

module.exports = { getDocumentSummary };
