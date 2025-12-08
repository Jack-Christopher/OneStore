export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const AuditLogSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entity_id: { type: String },
  old_data: Schema.Types.Mixed,
  new_data: Schema.Types.Mixed,
  performed_at: { type: Date, default: () => new Date(), required: true },
}, { collection: 'audit_logs', timestamps: false });

AuditLogSchema.index({ tenant_id: 1, performed_at: -1 });
AuditLogSchema.index({ user_id: 1, performed_at: -1 });

module.exports = model('AuditLog', AuditLogSchema);
