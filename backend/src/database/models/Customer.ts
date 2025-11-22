export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const CustomerSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  document: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  is_active: { type: Boolean, default: true },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'customers', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
CustomerSchema.index({ tenant_id: 1, document: 1 }, { unique: true, sparse: true });
module.exports = model('Customer', CustomerSchema);