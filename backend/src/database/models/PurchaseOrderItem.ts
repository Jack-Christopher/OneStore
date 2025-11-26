export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const PurchaseOrderItemSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  purchase_order_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  received_quantity: { type: Number, default: 0 },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'purchase_order_items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = model('PurchaseOrderItem', PurchaseOrderItemSchema);
