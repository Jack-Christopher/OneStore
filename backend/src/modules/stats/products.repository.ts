const Product = require("../../database/models/Product");
const WarehouseProduct = require("../../database/models/WarehouseProduct");

interface Filters {
  tenant_id?: string;
  date_from?: Date;
  date_to?: Date;
  page?: number;
  limit?: number;
}

module.exports = {
  async getAddedByMonth(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const limit = filters.limit || 12;

    const result = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          totalProducts: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      {
        $project: {
          month: "$_id",
          totalProducts: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getLowStock(filters: Filters) {
    if (!filters.tenant_id) return [];

    const products = await Product.find({ tenant_id: filters.tenant_id }).lean();
    const warehouseProducts = await WarehouseProduct.find({ tenant_id: filters.tenant_id }).lean();

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
      .sort((a: any, b: any) => a.currentStock - b.currentStock);

    const limit = filters.limit || 10;
    return lowStock.slice(0, limit);
  },

  async getActiveInactiveCount(filters: Filters) {
    if (!filters.tenant_id) return { active: 0, inactive: 0 };

    const matchStage: any = { tenant_id: filters.tenant_id };

    const result = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$is_active",
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = { active: 0, inactive: 0 };
    result.forEach((item: any) => {
      if (item._id === true || item._id === undefined) {
        counts.active = item.count;
      } else {
        counts.inactive = item.count;
      }
    });

    return counts;
  },

  async getStockRotation(filters: Filters) {
    if (!filters.tenant_id) return { rotation: 0 };

    // Get total stock value
    const SaleItem = require("../../database/models/SaleItem");
    
    const products = await Product.find({ tenant_id: filters.tenant_id }).lean();
    const warehouseProducts = await WarehouseProduct.find({ tenant_id: filters.tenant_id }).lean();

    const stockMap = new Map<string, number>();
    warehouseProducts.forEach((wp: any) => {
      const current = stockMap.get(wp.product_id) || 0;
      stockMap.set(wp.product_id, current + (wp.quantity || 0));
    });

    // Calculate total stock value
    let totalStockValue = 0;
    products.forEach((p: any) => {
      const stock = stockMap.get(p._id.toString()) || 0;
      const value = stock * (p.purchase_price || p.sale_price || 0);
      totalStockValue += value;
    });

    // Get sales from last 30 days to estimate rotation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesLast30Days = await SaleItem.aggregate([
      {
        $match: {
          tenant_id: filters.tenant_id,
          created_at: { $gte: thirtyDaysAgo }
        }
      },
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
          _id: null,
          totalSalesValue: {
            $sum: {
              $multiply: [
                "$quantity",
                { $ifNull: ["$product.purchase_price", "$product.sale_price", 0] }
              ]
            }
          }
        }
      }
    ]);

    const monthlySalesValue = salesLast30Days[0]?.totalSalesValue || 0;
    
    // Rotation = (Sales in 30 days * 12) / Stock value
    // This gives an approximate annual rotation rate
    const rotation = totalStockValue > 0 
      ? ((monthlySalesValue * 12) / totalStockValue) 
      : 0;

    return { rotation: Math.round(rotation * 100) / 100 };
  }
};

