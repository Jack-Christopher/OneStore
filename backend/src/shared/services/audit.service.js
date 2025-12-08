const AuditLog = require("../../database/models/AuditLog");

async function logAudit({ tenant_id, user_id, action, entity, entity_id, old_data = null, new_data = null }) {
  return AuditLog.create({
    tenant_id,
    user_id,
    action,
    entity,
    entity_id,
    old_data,
    new_data,
    performed_at: new Date()
  });
}

module.exports = { logAudit };

