export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const WarehouseSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  is_active: { type: Boolean, default: true },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'warehouses', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
WarehouseSchema.index({ tenant_id: 1, name: 1 }, { unique: true });
module.exports = model('Warehouse', WarehouseSchema);
