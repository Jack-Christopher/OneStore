const AuditLog = require("../../database/models/AuditLog");
const User = require("../../database/models/User");

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
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  async findById(id: string) {
    return AuditLog.findById(id).lean();
  }
};

