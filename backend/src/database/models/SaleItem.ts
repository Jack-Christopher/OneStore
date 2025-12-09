export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const SaleItemSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  sale_id: { type: String, required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  unit_id: { type: Schema.Types.ObjectId, ref: "UnitOfMeasure", required: true },
  quantity: { type: Number, required: true },
  unit_price_original: { type: Number, required: true },
  unit_price_base: { type: Number, required: true },
  unit_price: { type: Number, required: true }, // Keep for backward compatibility
  subtotal: { type: Number, required: true },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'sale_items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('SaleItem', SaleItemSchema);
