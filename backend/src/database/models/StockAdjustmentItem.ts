export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const StockAdjustmentItemSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  adjustment_id: { type: String, required: true },
  product_id: { type: String, required: true },
  old_quantity: { type: Number, required: true },
  new_quantity: { type: Number, required: true },
  difference: { type: Number, required: true },
  notes: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'stock_adjustment_items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('StockAdjustmentItem', StockAdjustmentItemSchema);
