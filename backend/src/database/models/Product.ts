export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const ProductSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  unit_id: { type: Schema.Types.ObjectId, ref: "UnitOfMeasure", required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: { type: String },
  purchase_price: { type: Number },
  sale_price: { type: Number, required: true },
  min_stock: { type: Number },
  max_stock: { type: Number },
  description: { type: String },
  is_active: { type: Boolean, default: true },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'products', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
ProductSchema.index({ tenant_id: 1, sku: 1 }, { unique: true });
ProductSchema.index({ barcode: 1 }, { sparse: true });
module.exports = model('Product', ProductSchema);