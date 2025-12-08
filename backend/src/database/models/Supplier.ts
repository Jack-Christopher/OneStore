export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const SupplierSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  contact_name: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  ruc: { type: String },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'suppliers', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
SupplierSchema.index({ tenant_id: 1, name: 1 });
module.exports = model('Supplier', SupplierSchema);
