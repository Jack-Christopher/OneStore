export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const TransferItemSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  transfer_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, required: true },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'transfer_items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('TransferItem', TransferItemSchema);
