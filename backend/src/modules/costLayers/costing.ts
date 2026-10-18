export type FreightMode = "none" | "per_bag" | "prorated";

export const COST_ALERT_PERCENT = 5;

const SKU_PREFIX: Record<string, string> = {
  input: "INS",
  finished: "NUC",
  resale: "REV"
};

export function skuPrefix(productType?: string): string {
  return SKU_PREFIX[productType || ""] || "REV";
}

export function stockFactor(value?: number | null): number {
  return value && value > 0 ? value : 1;
}

export function stockQuantity(purchaseQuantity: number, factor?: number | null): number {
  return purchaseQuantity * stockFactor(factor);
}

export interface ReceiptCostInput {
  mode: FreightMode;
  freightAmount: number;
  penPerDocumentUnit: number;
  quantity: number;
  stockFactor: number;
  unitCostBase: number;
  lineValueDoc: number;
  totalValueDoc: number;
}

export interface ReceiptCost {
  stockQty: number;
  unitCostPen: number;
  freightPen: number;
}

export function receiptCost(input: ReceiptCostInput): ReceiptCost {
  const factor = stockFactor(input.stockFactor);
  const stockQty = input.quantity * factor;
  const goodsPerStockUnit = stockQty > 0 ? input.unitCostBase / factor : 0;
  let freightPerStockUnit = 0;

  if (input.mode === "per_bag" && input.freightAmount > 0) {
    freightPerStockUnit = (input.freightAmount * input.penPerDocumentUnit) / factor;
  } else if (input.mode === "prorated" && input.freightAmount > 0 && input.totalValueDoc > 0 && stockQty > 0) {
    const share = input.lineValueDoc / input.totalValueDoc;
    const lineFreightPen = input.freightAmount * input.penPerDocumentUnit * share;
    freightPerStockUnit = lineFreightPen / stockQty;
  }

  return {
    stockQty,
    unitCostPen: goodsPerStockUnit + freightPerStockUnit,
    freightPen: freightPerStockUnit * stockQty
  };
}

export function isPriceStale(previousCost: number, nextCost: number, salePrice: number, marginPercent: number): boolean {
  if (!(previousCost > 0) || !(nextCost > 0) || !(salePrice > 0)) return false;
  const rose = nextCost >= previousCost * (1 + COST_ALERT_PERCENT / 100);
  const suggested = nextCost * (1 + (marginPercent || 0) / 100);
  return rose && salePrice + 0.0001 < suggested;
}

export function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseSunatTxt(body: string): { date: string; buy: number; sell: number } | null {
  const match = String(body).match(/(\d{2})\/(\d{2})\/(\d{4})\|([0-9]+(?:\.[0-9]+)?)\|([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return null;
  const buy = Number(match[4]);
  const sell = Number(match[5]);
  if (!(buy > 0) || !(sell > 0)) return null;
  return {
    date: `${match[3]}-${match[2]}-${match[1]}`,
    buy,
    sell
  };
}

export function parseFallbackRate(payload: any): { buy: number; sell: number } | null {
  const pen = Number(payload?.rates?.PEN ?? payload?.rates?.pen);
  if (!(pen > 0)) return null;
  return { buy: pen, sell: pen };
}
