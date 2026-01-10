const { logAudit } = require("../services/audit.service");

function sanitizeSensitiveData(data, visited = new WeakSet()) {
  if (!data || typeof data !== 'object') return data;

  // Handle circular references
  if (visited.has(data)) {
    return '[Circular Reference]';
  }

  // If it's a Mongoose document, convert to plain object first to avoid circular refs
  let plainData = data;
  if (data && typeof data.toObject === 'function') {
    try {
      plainData = data.toObject({ depopulate: true });
    } catch (e) {
      // If toObject fails, try toJSON
      try {
        plainData = data.toJSON ? data.toJSON() : JSON.parse(JSON.stringify(data));
      } catch (e2) {
        // Last resort: just use the data as is but mark as visited
        visited.add(data);
        return data;
      }
    }
  } else if (data && typeof data.toJSON === 'function') {
    try {
      plainData = data.toJSON();
    } catch (e) {
      try {
        plainData = JSON.parse(JSON.stringify(data));
      } catch (e2) {
        visited.add(data);
        return data;
      }
    }
  }

  // Handle arrays
  if (Array.isArray(plainData)) {
    visited.add(data);
    return plainData.map(item => sanitizeSensitiveData(item, visited));
  }

  // Add to visited set to prevent circular references
  visited.add(data);

  const sanitized = {};

  // Remove sensitive fields and sanitize nested objects
  for (const key in plainData) {
    if (!plainData.hasOwnProperty(key)) continue;
    
    // Skip sensitive fields
    if (key === 'password' || key === 'token' || key === 'session') {
      continue;
    }
    
    // Skip Mongoose-specific properties
    if (key.startsWith('$') || key === '__v' || key === '_doc' || key === 'isNew' || key === 'save' || key === 'remove') {
      continue;
    }

    const value = plainData[key];
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeSensitiveData(value, visited);
    } else {
      sanitized[key] = value;
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

