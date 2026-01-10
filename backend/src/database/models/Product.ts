export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const ProductSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  category_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  unit_id: { type: Schema.Types.ObjectId, ref: "UnitOfMeasure", default: null },
  supplier_id: { type: Schema.Types.ObjectId, ref: "Supplier", default: null },
  name: { type: String, required: true },
  sku: { type: String, default: null },
  barcode: { type: String, default: null },
  purchase_price: { type: Number, default: null },
  sale_price: { type: Number, default: null },
  min_stock: { type: Number, default: null },
  max_stock: { type: Number, default: null },
  description: { type: String, default: null },
  sub_units_per_unit: { type: Number, default: 1 },
  is_active: { type: Boolean, default: true },
  metadata: Schema.Types.Mixed,
  created_by: { type: String, default: null },
  updated_by: { type: String, default: null }
}, { collection: 'products', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
ProductSchema.index({ tenant_id: 1, name: 1 }, { unique: true });
ProductSchema.index({ barcode: 1 }, { sparse: true });
ProductSchema.index({ sku: 1 }, { sparse: true });
module.exports = model('Product', ProductSchema);