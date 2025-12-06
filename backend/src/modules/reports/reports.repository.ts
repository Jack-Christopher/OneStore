const Sale = require("../../database/models/Sale");
const SaleItem = require("../../database/models/SaleItem");
const PurchaseOrder = require("../../database/models/PurchaseOrder");
const Product = require("../../database/models/Product");
const Category = require("../../database/models/Category");
const WarehouseProduct = require("../../database/models/WarehouseProduct");
const User = require("../../database/models/User");

module.exports = {
  async getSalesSummary(tenantId: string, startDate?: Date, endDate?: Date) {
    const matchStage: any = { tenant_id: tenantId, status: 'completed' };

    if (startDate || endDate) {
      matchStage.created_at = {};
      if (startDate) matchStage.created_at.$gte = startDate;
      if (endDate) matchStage.created_at.$lte = endDate;
    }

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
          averageAmount: { $avg: "$total_amount" }
        }
      }
    ]);

    return result[0] || { totalSales: 0, totalAmount: 0, averageAmount: 0 };
  },

  async getPurchasesSummary(tenantId: string, startDate?: Date, endDate?: Date) {
    const matchStage: any = { tenant_id: tenantId };

    if (startDate || endDate) {
      matchStage.created_at = {};
      if (startDate) matchStage.created_at.$gte = startDate;
      if (endDate) matchStage.created_at.$lte = endDate;
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

  async getTopProducts(tenantId: string, limit: number = 10, startDate?: Date, endDate?: Date) {
    const matchStage: any = { tenant_id: tenantId };

    if (startDate || endDate) {
      matchStage.created_at = {};
      if (startDate) matchStage.created_at.$gte = startDate;
      if (endDate) matchStage.created_at.$lte = endDate;
    }

    const result = await SaleItem.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$product_id",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$subtotal" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$productId"] } } }
          ],
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          productName: { $ifNull: ["$product.name", "Producto eliminado"] },
          totalQuantity: 1,
          totalAmount: 1
        }
      }
    ]);

    return result;
  },

  async getTopCategories(tenantId: string, limit: number = 10, startDate?: Date, endDate?: Date) {
    const matchStage: any = { tenant_id: tenantId };

    if (startDate || endDate) {
      matchStage.created_at = {};
      if (startDate) matchStage.created_at.$gte = startDate;
      if (endDate) matchStage.created_at.$lte = endDate;
    }

    const result = await SaleItem.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$product_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$productId"] } } }
          ],
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$product.category_id",
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$subtotal" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryId: "$_id",
          categoryName: { $ifNull: ["$category.name", "Sin categoría"] },
          totalQuantity: 1,
          totalAmount: 1
        }
      }
    ]);

    return result;
  },

  async getLowStockProducts(tenantId: string, limit: number = 10) {
    const products = await Product.find({ tenant_id: tenantId }).lean();
    const warehouseProducts = await WarehouseProduct.find({ tenant_id: tenantId }).lean();

    const stockMap = new Map<string, number>();
    warehouseProducts.forEach((wp: any) => {
      const current = stockMap.get(wp.product_id) || 0;
      stockMap.set(wp.product_id, current + (wp.quantity || 0));
    });

    const lowStock = products
      .map((product: any) => ({
        productId: product._id.toString(),
        productName: product.name,
        currentStock: stockMap.get(product._id.toString()) || 0,
        minStock: product.min_stock || 0
      }))
      .filter((p: any) => p.currentStock <= p.minStock)
      .sort((a: any, b: any) => a.currentStock - b.currentStock)
      .slice(0, limit);

    return lowStock;
  },

  async getFinancialSummary(tenantId: string, startDate?: Date, endDate?: Date) {
    const salesMatch: any = { tenant_id: tenantId, status: 'completed' };
    const purchasesMatch: any = { tenant_id: tenantId, status: 'received' };

    if (startDate || endDate) {
      salesMatch.created_at = {};
      purchasesMatch.created_at = {};
      if (startDate) {
        salesMatch.created_at.$gte = startDate;
        purchasesMatch.created_at.$gte = startDate;
      }
      if (endDate) {
        salesMatch.created_at.$lte = endDate;
        purchasesMatch.created_at.$lte = endDate;
      }
    }

    const [salesResult, purchasesResult] = await Promise.all([
      Sale.aggregate([
        { $match: salesMatch },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$total_amount" },
            salesCount: { $sum: 1 }
          }
        }
      ]),
      PurchaseOrder.aggregate([
        { $match: purchasesMatch },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$total_amount" },
            purchasesCount: { $sum: 1 }
          }
        }
      ])
    ]);

    const sales = salesResult[0] || { totalIncome: 0, salesCount: 0 };
    const purchases = purchasesResult[0] || { totalExpenses: 0, purchasesCount: 0 };

    return {
      totalIncome: sales.totalIncome,
      totalExpenses: purchases.totalExpenses,
      netProfit: sales.totalIncome - purchases.totalExpenses,
      salesCount: sales.salesCount,
      purchasesCount: purchases.purchasesCount
    };
  },

  async getSalesByPeriod(tenantId: string, period: 'day' | 'week' | 'month' = 'day', limit: number = 30) {
    const groupBy = period === 'day'
      ? { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }
      : period === 'week'
        ? { $dateToString: { format: "%Y-W%V", date: "$created_at" } }
        : { $dateToString: { format: "%Y-%m", date: "$created_at" } };

    const result = await Sale.aggregate([
      { $match: { tenant_id: tenantId, status: 'completed' } },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: limit }
    ]);

    return result.reverse();
  },

  async getRecentSales(tenantId: string, limit: number = 10) {
    return Sale.find({ tenant_id: tenantId })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  },

  async getRecentPurchases(tenantId: string, limit: number = 10) {
    return PurchaseOrder.find({ tenant_id: tenantId })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  }
};

