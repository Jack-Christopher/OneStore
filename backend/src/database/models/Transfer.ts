export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const TransferSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  from_warehouse_id: { type: String, required: true },
  to_warehouse_id: { type: String, required: true },
  user_id: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'pending' },
  reference: { type: String },
  notes: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'transfers', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('Transfer', TransferSchema);
