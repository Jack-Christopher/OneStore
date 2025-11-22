export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const TenantSettingSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  key: { type: String, required: true },
  value: Schema.Types.Mixed,
  description: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'tenant_settings', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
TenantSettingSchema.index({ tenant_id: 1, key: 1 }, { unique: true });
module.exports = model('TenantSetting', TenantSettingSchema);
