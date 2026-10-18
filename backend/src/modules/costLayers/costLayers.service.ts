export { };
const CostLayer = require("../../database/models/CostLayer");
const Product = require("../../database/models/Product");
const { isPriceStale } = require("./costing");

async function openLayer(input: {
  tenantId: string;
  warehouseId: string;
  productId: string;
  source: "purchase" | "adjustment" | "sale_reversal";
  purchaseOrderId?: string | null;
  receivedAt?: Date;
  qty: number;
  unitCostPen: number;
  currencyCode?: string | null;
  exchangeRate?: number | null;
  freightPen?: number;
}) {
  if (!(input.qty > 0)) return null;
  return CostLayer.create({
    tenant_id: input.tenantId,
    warehouse_id: input.warehouseId,
    product_id: input.productId,
    source: input.source,
    purchase_order_id: input.purchaseOrderId || null,
    received_at: input.receivedAt || new Date(),
    qty_original: input.qty,
    qty_remaining: input.qty,
    unit_cost_pen: input.unitCostPen || 0,
    currency_code: input.currencyCode || "PEN",
    exchange_rate: input.exchangeRate ?? null,
    freight_pen: input.freightPen || 0
  });
}

async function consume(input: {
  tenantId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
}) {
  const layers = await CostLayer.find({
    tenant_id: input.tenantId,
    warehouse_id: input.warehouseId,
    product_id: input.productId,
    qty_remaining: { $gt: 0 }
  }).sort({ received_at: 1, created_at: 1 });

  let remaining = input.quantity;
  let costValue = 0;
  let consumedQty = 0;
  const allocations: { layer_id: string; quantity: number; unit_cost_pen: number }[] = [];

  for (const layer of layers) {
    if (remaining <= 0) break;
    const take = Math.min(layer.qty_remaining, remaining);
    layer.qty_remaining = Number((layer.qty_remaining - take).toFixed(6));
    await layer.save();
    allocations.push({
      layer_id: layer._id.toString(),
      quantity: take,
      unit_cost_pen: layer.unit_cost_pen
    });
    costValue += take * layer.unit_cost_pen;
    consumedQty += take;
    remaining -= take;
  }

  let unitCostPen: number | null = consumedQty > 0 ? costValue / consumedQty : null;
  const uncovered = remaining > 0 ? remaining : 0;

  if (uncovered > 0) {
    const product = await Product.findById(input.productId).lean();
    const fallback = product?.purchase_price || 0;
    costValue += uncovered * fallback;
    unitCostPen = input.quantity > 0 ? costValue / input.quantity : fallback;
  }

  return { unitCostPen, uncovered, allocations };
}

async function restoreAllocations(allocations: { layer_id: string; quantity: number; unit_cost_pen: number }[] = []) {
  for (const allocation of allocations) {
    if (!allocation?.layer_id || !(allocation.quantity > 0)) continue;
    const layer = await CostLayer.findById(allocation.layer_id);
    if (!layer) continue;
    layer.qty_remaining = Number((layer.qty_remaining + allocation.quantity).toFixed(6));
    await layer.save();
  }
}

async function refreshAverageCost(productId: string) {
  const product = await Product.findById(productId);
  if (!product) return null;

  const layers = await CostLayer.find({ product_id: productId, qty_remaining: { $gt: 0 } }).lean();
  let qty = 0;
  let value = 0;
  for (const layer of layers) {
    qty += layer.qty_remaining;
    value += layer.qty_remaining * layer.unit_cost_pen;
  }

  const previous = product.purchase_price || 0;
  if (qty > 0) {
    const average = value / qty;
    product.last_cost_pen = average;
    product.purchase_price = average;
    product.price_stale = isPriceStale(previous, average, product.sale_price || 0, product.margin_percent || 0);
  }

  await product.save();
  return product;
}

module.exports = {
  openLayer,
  consume,
  restoreAllocations,
  refreshAverageCost
};
