export { };
const Counter = require("../../database/models/Counter");
const { skuPrefix } = require("../costLayers/costing");

async function nextSku(tenantId: string, productType?: string): Promise<string> {
  const prefix = skuPrefix(productType);
  const counter = await Counter.findOneAndUpdate(
    { tenant_id: tenantId, key: `sku:${prefix}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `${prefix}-${String(counter.seq).padStart(6, "0")}`;
}

module.exports = { nextSku };
