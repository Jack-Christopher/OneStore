const User = require("../../database/models/User");

interface Filters {
  tenant_id?: string;
}

module.exports = {
  async getCount(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) {
      matchStage.tenant_id = filters.tenant_id;
    }

    const result = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const total = await User.countDocuments(matchStage);
    
    const byRole: any = {};
    result.forEach((item: any) => {
      byRole[item.role] = item.count;
    });

    return {
      total,
      byRole
    };
  },

  async getActiveCount(filters: Filters) {
    const matchStage: any = { is_active: true };
    
    if (filters.tenant_id) {
      matchStage.tenant_id = filters.tenant_id;
    }

    const activeCount = await User.countDocuments(matchStage);
    return activeCount;
  },

  async getAddedByMonth(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const limit = filters.limit || 12;

    const result = await User.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          totalUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      {
        $project: {
          month: "$_id",
          totalUsers: 1,
          _id: 0
        }
      }
    ]);

    return result;
  }
};

