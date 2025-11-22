export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const StockMovementSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  warehouse_id: { type: String, required: true },
  product_id: { type: String, required: true },
  movement_type: { type: String, enum: ['purchase', 'sale', 'adjustment_in', 'adjustment_out', 'transfer_in', 'transfer_out'], required: true },
  quantity: { type: Number, required: true },
  related_id: { type: String },
  comment: { type: String },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'stock_movements', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
StockMovementSchema.index({ created_at: -1 });
module.exports = model('StockMovement', StockMovementSchema);
