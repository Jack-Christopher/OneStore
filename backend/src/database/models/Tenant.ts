export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const TenantSchema = new Schema({
  name: { type: String, required: true },
  legal_name: { type: String },
  document_type: { type: String },
  document_number: { type: String, sparse: true, unique: false },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  created_by: { type: String },
  updated_by: { type: String },
  metadata: Schema.Types.Mixed
}, { collection: 'tenants', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
TenantSchema.index({ _id: 1 }, { unique: true });
TenantSchema.index({ document_number: 1 }, { unique: true, sparse: true });
module.exports = model('Tenant', TenantSchema);
