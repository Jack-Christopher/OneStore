export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const SaleItemSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  sale_id: { type: String, required: true },
  product_id: { type: String, required: true },
  unit_id: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'sale_items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('SaleItem', SaleItemSchema);
