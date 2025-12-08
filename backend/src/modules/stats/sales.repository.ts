const Sale = require("../../database/models/Sale");
const SaleItem = require("../../database/models/SaleItem");
const Product = require("../../database/models/Product");

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
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
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

  async getByDay(filters: Filters) {
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const limit = filters.limit || 30;

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      {
        $project: {
          date: "$_id",
          totalSales: 1,
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getByMonth(filters: Filters) {
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const limit = filters.limit || 12;

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      {
        $project: {
          month: "$_id",
          totalSales: 1,
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getTopProducts(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    // If filtering by user_id, we need to join with sales
    if (filters.user_id) {
      const saleMatchStage: any = {
        tenant_id: filters.tenant_id,
        user_id: filters.user_id,
        status: 'completed'
      };
      
      if (filters.date_from || filters.date_to) {
        saleMatchStage.created_at = {};
        if (filters.date_from) saleMatchStage.created_at.$gte = filters.date_from;
        if (filters.date_to) saleMatchStage.created_at.$lte = filters.date_to;
      }
      
      const sales = await Sale.find(saleMatchStage).select('_id').lean();
      
      if (sales.length === 0) {
        return [];
      }
      
      const saleIds = sales.map(s => s._id.toString());
      matchStage.sale_id = { $in: saleIds };
    }

    const limit = filters.limit || 10;

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
          totalAmount: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getByPaymentMethod(filters: Filters) {
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $ifNull: ["$payment_method", "No especificado"] },
          totalAmount: { $sum: "$total_amount" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          paymentMethod: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getByHour(filters: Filters) {
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: "$created_at" },
          totalAmount: { $sum: "$total_amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getAverageTicketByDay(filters: Filters) {
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const limit = filters.limit || 30;

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          averageTicket: { $avg: "$total_amount" },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
      {
        $project: {
          date: "$_id",
          averageTicket: 1,
          totalSales: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getByWarehouse(filters: Filters) {
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$warehouse_id",
          totalAmount: { $sum: "$total_amount" },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "_id",
          foreignField: "_id",
          as: "warehouse"
        }
      },
      { $unwind: { path: "$warehouse", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          warehouseId: "$_id",
          warehouseName: { $ifNull: ["$warehouse.name", "Almacén eliminado"] },
          totalAmount: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    return result;
  },

  async getTopCustomers(filters: Filters) {
    const matchStage: any = { status: 'completed' };
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    if (filters.user_id) matchStage.user_id = filters.user_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const limit = filters.limit || 10;

    const result = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $ifNull: ["$customer_document", "$customer_name", "Cliente sin identificar"]
          },
          customerName: { $first: "$customer_name" },
          customerDocument: { $first: "$customer_document" },
          totalAmount: { $sum: "$total_amount" },
          purchaseCount: { $sum: 1 }
        }
      },
      { $sort: { purchaseCount: -1 } },
      { $limit: limit },
      {
        $project: {
          customerDocument: { $ifNull: ["$customerDocument", ""] },
          customerName: { $ifNull: ["$customerName", "Cliente sin identificar"] },
          totalAmount: 1,
          purchaseCount: 1,
          _id: 0
        }
      }
    ]);

    return result;
  },

  async getSalesByCategory(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    // If filtering by user_id, we need to join with sales
    if (filters.user_id) {
      const saleMatchStage: any = {
        tenant_id: filters.tenant_id,
        user_id: filters.user_id,
        status: 'completed'
      };
      
      if (filters.date_from || filters.date_to) {
        saleMatchStage.created_at = {};
        if (filters.date_from) saleMatchStage.created_at.$gte = filters.date_from;
        if (filters.date_to) saleMatchStage.created_at.$lte = filters.date_to;
      }
      
      const sales = await Sale.find(saleMatchStage).select('_id').lean();
      
      if (sales.length === 0) {
        return [];
      }
      
      const saleIds = sales.map(s => s._id.toString());
      matchStage.sale_id = { $in: saleIds };
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
          totalAmount: 1,
          _id: 0
        }
      },
      { $sort: { totalQuantity: -1 } }
    ]);

    return result;
  },

  async getProductMargins(filters: Filters) {
    if (!filters.tenant_id) return [];

    const limit = filters.limit || 50;

    const products = await Product.find({ 
      tenant_id: filters.tenant_id,
      purchase_price: { $exists: true, $ne: null },
      sale_price: { $exists: true, $ne: null }
    }).limit(limit).lean();

    return products.map((p: any) => ({
      productId: p._id.toString(),
      productName: p.name,
      purchasePrice: p.purchase_price || 0,
      salePrice: p.sale_price || 0,
      margin: (p.sale_price || 0) - (p.purchase_price || 0),
      marginPercent: p.purchase_price > 0 
        ? (((p.sale_price || 0) - (p.purchase_price || 0)) / p.purchase_price) * 100
        : 0
    }));
  }
};

