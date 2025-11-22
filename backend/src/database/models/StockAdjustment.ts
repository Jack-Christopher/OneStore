export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const StockAdjustmentSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  warehouse_id: { type: String, required: true },
  user_id: { type: String, required: true },
  reason: { type: String, required: true },
  notes: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'stock_adjustments', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('StockAdjustment', StockAdjustmentSchema);
