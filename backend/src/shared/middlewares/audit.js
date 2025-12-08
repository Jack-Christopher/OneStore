const { logAudit } = require("../services/audit.service");

function sanitizeSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.session;

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeSensitiveData(sanitized[key]);
    }
  }

  return sanitized;
}

async function auditCreate(entityName, createdRecord, req) {
  const tenant_id = createdRecord.tenant_id || req.user?.tenant_id || req.headers["x-tenant-id"] || "orphan";
  const user_id = req.user?.id || "system";

  await logAudit({
    tenant_id: tenant_id,
    user_id: user_id,
    action: "create",
    entity: entityName,
    entity_id: createdRecord._id?.toString(),
    new_data: sanitizeSensitiveData(createdRecord)
  });
}

async function auditUpdate(entityName, oldRecord, newRecord, req) {
  const tenant_id = newRecord?.tenant_id || oldRecord?.tenant_id || req.user?.tenant_id || req.headers["x-tenant-id"] || "orphan";
  const user_id = req.user?.id || "system";

  // Special handling for password changes
  let old_data = sanitizeSensitiveData(oldRecord);
  let new_data = sanitizeSensitiveData(newRecord);

  if (entityName === "User" && (req.body?.password || (oldRecord?.password && newRecord?.password && oldRecord.password !== newRecord.password))) {
    old_data = { password_changed: true };
    new_data = { password_changed: true };
  }

  await logAudit({
    tenant_id: tenant_id,
    user_id: user_id,
    action: "update",
    entity: entityName,
    entity_id: newRecord?._id?.toString() || oldRecord?._id?.toString(),
    old_data: old_data,
    new_data: new_data
  });
}

async function auditDelete(entityName, deletedRecord, req) {
  const tenant_id = deletedRecord?.tenant_id || req.user?.tenant_id || req.headers["x-tenant-id"] || "orphan";
  const user_id = req.user?.id || "system";

  await logAudit({
    tenant_id: tenant_id,
    user_id: user_id,
    action: "delete",
    entity: entityName,
    entity_id: deletedRecord._id?.toString(),
    old_data: sanitizeSensitiveData(deletedRecord)
  });
}

module.exports = { auditCreate, auditUpdate, auditDelete };

