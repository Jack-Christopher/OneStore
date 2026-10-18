const AuditLog = require("../../database/models/AuditLog");
const User = require("../../database/models/User");

function isObjectId(value: unknown) {
  return /^[0-9a-fA-F]{24}$/.test(String(value || ""));
}

async function withUserNames(logs: any[]) {
  const ids = [...new Set(logs.map((log) => String(log.user_id || "")).filter(isObjectId))];
  const users = ids.length
    ? await User.find({ _id: { $in: ids } }).select("full_name email").lean()
    : [];
  const names = new Map(users.map((user: any) => [String(user._id), user.full_name || user.email || "Usuario"]));
  return logs.map((log) => ({
    ...log,
    user_name: names.get(String(log.user_id)) || "Usuario no disponible"
  }));
}

module.exports = {
  async findAll(filters: any, page: number = 1, limit: number = 50) {
    const query: any = {};

    // Apply filters
    if (filters.tenant_id) {
      query.tenant_id = filters.tenant_id;
    }

    if (filters.user_id) {
      query.user_id = filters.user_id;
    }

    if (filters.entity) {
      query.entity = filters.entity;
    }

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.date_from || filters.date_to) {
      query.performed_at = {};
      if (filters.date_from) {
        query.performed_at.$gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        const dateTo = new Date(filters.date_to);
        dateTo.setHours(23, 59, 59, 999);
        query.performed_at.$lte = dateTo;
      }
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ performed_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs: await withUserNames(logs),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  async findById(id: string) {
    const log = await AuditLog.findById(id).lean();
    if (!log) return null;
    const [named] = await withUserNames([log]);
    return named;
  }
};

