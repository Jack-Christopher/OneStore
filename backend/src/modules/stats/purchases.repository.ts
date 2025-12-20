const PurchaseOrder = require("../../database/models/PurchaseOrder");

interface Filters {
  tenant_id?: string;
  user_id?: string;
  date_from?: Date;
  date_to?: Date;
  page?: number;
  limit?: number;
}

module.exports = {
  async getSummary(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" }
        }
      }
    ]);

    const summary = {
      totalOrders: 0,
      pendingOrders: 0,
      receivedOrders: 0,
      canceledOrders: 0,
      totalAmount: 0
    };

    result.forEach((item: any) => {
      summary.totalOrders += item.count;
      summary.totalAmount += item.totalAmount;
      if (item._id === 'pending') summary.pendingOrders = item.count;
      if (item._id === 'received') summary.receivedOrders = item.count;
      if (item._id === 'canceled') summary.canceledOrders = item.count;
    });

    return summary;
  },

  async getByMonth(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const limit = filters.limit || 12;

    const result = await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      {
        $project: {
          month: "$_id",
          totalOrders: 1,
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getAverageCostPerDay(filters: Filters) {
    const matchStage: any = { status: 'received' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          dailyTotal: { $sum: "$total_amount" },
          dailyCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageCostPerDay: { $avg: "$dailyTotal" },
          totalDays: { $sum: 1 }
        }
      }
    ]);

    return result[0] || { averageCostPerDay: 0, totalDays: 0 };
  },

  async getBySupplier(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$supplier_id",
          totalAmount: { $sum: "$total_amount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "_id",
          foreignField: "_id",
          as: "supplier"
        }
      },
      { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          supplierId: "$_id",
          supplierName: { $ifNull: ["$supplier.name", "Proveedor eliminado"] },
          totalAmount: 1,
          orderCount: 1,
          _id: 0
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    return result;
  },

  async getPurchasesActivity(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await PurchaseOrder.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: "$created_at" },
            hour: { $hour: "$created_at" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          dayOfWeek: "$_id.dayOfWeek",
          hour: "$_id.hour",
          count: 1,
          _id: 0
        }
      }
    ]);

    return result;
  }
};
