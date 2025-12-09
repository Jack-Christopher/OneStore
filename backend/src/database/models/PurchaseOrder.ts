export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const PurchaseOrderSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  supplier_id: { type: String, required: true },
  warehouse_id: { type: String, required: true },
  user_id: { type: String, required: true },
  status: { type: String, enum: ['pending', 'received', 'canceled'], default: 'pending' },
  reference_number: { type: String },
  currency_code: { type: String, required: true },
  exchange_rate: { type: Number, required: true },
  total_original: { type: Number, required: true },
  total_base: { type: Number, required: true },
  total_amount: { type: Number, required: true }, // Keep for backward compatibility
  notes: { type: String },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'purchase_orders', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('PurchaseOrder', PurchaseOrderSchema);
