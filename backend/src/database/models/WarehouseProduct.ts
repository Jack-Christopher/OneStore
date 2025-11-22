export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const WarehouseProductSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  warehouse_id: { type: String, required: true },
  product_id: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  reserved: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'warehouse_products', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
WarehouseProductSchema.index({ warehouse_id: 1, product_id: 1, tenant_id: 1 }, { unique: true });
module.exports = model('WarehouseProduct', WarehouseProductSchema);
