export { };
const { Schema, model } = require("mongoose");

const CostLayerSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  warehouse_id: { type: String, required: true },
  product_id: { type: String, required: true },
  source: { type: String, enum: ["purchase", "adjustment", "sale_reversal"], required: true },
  purchase_order_id: { type: String, default: null },
  received_at: { type: Date, required: true },
  qty_original: { type: Number, required: true },
  qty_remaining: { type: Number, required: true },
  unit_cost_pen: { type: Number, required: true },
  currency_code: { type: String, default: "PEN" },
  exchange_rate: { type: Number, default: null },
  freight_pen: { type: Number, default: 0 }
}, { collection: "cost_layers", timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

CostLayerSchema.index({ tenant_id: 1, product_id: 1, warehouse_id: 1, received_at: 1 });

module.exports = model("CostLayer", CostLayerSchema);
