export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const SaleSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  warehouse_id: { type: String, required: true },
  user_id: { type: String, required: true },
  customer_id: { type: String },
  customer_name: { type: String },
  customer_document: { type: String },
  status: { type: String, enum: ['completed', 'canceled'], default: 'completed' },
  payment_method: { type: String },
  currency_code: { type: String, required: true },
  exchange_rate: { type: Number, required: true },
  total_original: { type: Number, required: true },
  total_base: { type: Number, required: true },
  total_amount: { type: Number, required: true }, // Keep for backward compatibility
  notes: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'sales', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('Sale', SaleSchema);
