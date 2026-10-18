export { };
const { stringify } = require("csv-stringify/sync");
const User = require("../../database/models/User");
const PurchaseOrder = require("../../database/models/PurchaseOrder");
const PurchaseOrderItem = require("../../database/models/PurchaseOrderItem");
const Product = require("../../database/models/Product");
const Supplier = require("../../database/models/Supplier");
const UnitOfMeasure = require("../../database/models/UnitOfMeasure");

function formatDate(value: any) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-PE");
}

function marginOf(cost: number, sale: number, marginPercent: number | null) {
  if (marginPercent !== null && marginPercent !== undefined) return marginPercent;
  if (!(cost > 0) || !(sale > 0)) return "";
  return Number((((sale - cost) / cost) * 100).toFixed(2));
}

async function buildCostSheetCsv(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user?.tenant_id || user.tenant_id === "orphan") {
    throw new Error("Tenant no disponible");
  }

  const tenantId = user.tenant_id;
  const [orders, products, suppliers, units] = await Promise.all([
    PurchaseOrder.find({ tenant_id: tenantId, status: "received" }).lean(),
    Product.find({ tenant_id: tenantId }).lean(),
    Supplier.find({ tenant_id: tenantId }).lean(),
    UnitOfMeasure.find({ tenant_id: tenantId }).lean()
  ]);

  const orderIds = orders.map((order: any) => order._id.toString());
  const items = orderIds.length
    ? await PurchaseOrderItem.find({ tenant_id: tenantId, purchase_order_id: { $in: orderIds } }).lean()
    : [];

  const ordersById = new Map(orders.map((order: any) => [order._id.toString(), order]));
  const productsById = new Map(products.map((product: any) => [product._id.toString(), product]));
  const suppliersById = new Map(suppliers.map((supplier: any) => [supplier._id.toString(), supplier]));
  const unitsById = new Map(units.map((unit: any) => [unit._id.toString(), unit]));

  const rows = items.map((item: any) => {
    const order: any = ordersById.get(String(item.purchase_order_id)) || {};
    const product: any = productsById.get(String(item.product_id)) || {};
    const supplier: any = suppliersById.get(String(order.supplier_id)) || suppliersById.get(String(product.supplier_id)) || {};
    const unit: any = unitsById.get(String(product.purchase_unit_id || product.unit_id)) || {};
    const currency = order.currency_code || "PEN";
    const priceUsd = currency === "USD" ? item.unit_cost_original ?? "" : "";
    const pricePen = item.unit_cost_base ?? item.unit_price ?? "";
    const factor = product.purchase_to_stock_factor > 0 ? product.purchase_to_stock_factor : 1;
    const costPen = typeof pricePen === "number" ? Number((pricePen / factor).toFixed(4)) : "";

    return {
      Proveedor: supplier.name || "",
      Producto: product.name || "",
      Factura: order.reference_number || "",
      "Fecha emision": formatDate(order.issued_at),
      "Fecha vencimiento": formatDate(order.due_at),
      "Fecha pago": formatDate(order.paid_at),
      Cantidad: item.quantity ?? "",
      Unidad: unit.name || "",
      "Precio USD": priceUsd,
      "Precio PEN": pricePen,
      Presentacion: factor,
      Flete: order.freight_amount || 0,
      "Flete modo": order.freight_mode || "none",
      "Tipo cambio SUNAT": order.sunat_sell || "",
      "Utilidad %": marginOf(Number(costPen) || 0, product.sale_price || 0, product.margin_percent),
      "Precio venta": product.sale_price ?? "",
      "Costo PEN unitario": costPen
    };
  });

  const csv = stringify(rows, {
    header: true,
    columns: rows.length ? Object.keys(rows[0]) : [
      "Proveedor", "Producto", "Factura", "Fecha emision", "Fecha vencimiento", "Fecha pago",
      "Cantidad", "Unidad", "Precio USD", "Precio PEN", "Presentacion", "Flete", "Flete modo",
      "Tipo cambio SUNAT", "Utilidad %", "Precio venta", "Costo PEN unitario"
    ]
  });

  return {
    filename: "costos.csv",
    mimeType: "text/csv; charset=utf-8",
    content: `\uFEFF${csv}`
  };
}

module.exports = { buildCostSheetCsv };
