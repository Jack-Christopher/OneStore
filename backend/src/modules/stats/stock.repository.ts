const StockMovement = require("../../database/models/StockMovement");
const WarehouseProduct = require("../../database/models/WarehouseProduct");
const Product = require("../../database/models/Product");
const Category = require("../../database/models/Category");

interface Filters {
  tenant_id?: string;
  date_from?: Date;
  date_to?: Date;
  product_id?: string;
}

module.exports = {
  async getStockValue(filters: Filters) {
    if (!filters.tenant_id) return { totalValue: 0, byCategory: [] };

    const products = await Product.find({ tenant_id: filters.tenant_id })
      .populate("category_id", "name")
      .lean();
    const warehouseProducts = await WarehouseProduct.find({ tenant_id: filters.tenant_id }).lean();

    const stockMap = new Map<string, number>();
    warehouseProducts.forEach((wp: any) => {
      const current = stockMap.get(wp.product_id) || 0;
      stockMap.set(wp.product_id, current + (wp.quantity || 0));
    });

    const productMap = new Map<string, any>();
    products.forEach((p: any) => {
      productMap.set(p._id.toString(), p);
    });

    let totalValue = 0;
    const categoryMap = new Map<string, { categoryName: string; value: number }>();

    stockMap.forEach((quantity, productId) => {
      const product = productMap.get(productId);
      if (product) {
        const value = quantity * (product.purchase_price || product.sale_price || 0);
        totalValue += value;

        const categoryId = product.category_id?._id?.toString() || product.category_id?.toString() || 'unknown';
        const categoryName = product.category_id?.name || 'Sin categoría';
        const current = categoryMap.get(categoryId) || { categoryName, value: 0 };
        categoryMap.set(categoryId, { categoryName, value: current.value + value });
      }
    });

    const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);

    return {
      totalValue,
      byCategory
    };
  },
  
  async getMovementTypesFrequency(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await StockMovement.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$movement_type",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      {
        $project: {
          movementType: "$_id",
          count: 1,
          totalQuantity: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result;
  },

  async getInventoryEvolution(filters: Filters) {
    if (!filters.tenant_id || !filters.product_id) return [];

    const matchStage: any = {
      tenant_id: filters.tenant_id,
      product_id: filters.product_id
    };
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    // Get initial stock
    const warehouseProducts = await WarehouseProduct.find({
      tenant_id: filters.tenant_id,
      product_id: filters.product_id
    }).lean();

    let currentStock = 0;
    warehouseProducts.forEach((wp: any) => {
      currentStock += wp.quantity || 0;
    });

    // Get movements and calculate running stock
    const movements = await StockMovement.find(matchStage)
      .sort({ created_at: 1 })
      .lean();

    const evolution: Array<{ date: string; stock: number; movement: number; type: string }> = [];
    let runningStock = currentStock;

    // Reverse calculate stock by going backwards through movements
    movements.reverse().forEach((mov: any) => {
      let stockChange = 0;
      if (mov.movement_type === 'purchase' || mov.movement_type === 'adjustment_in' || mov.movement_type === 'transfer_in') {
        stockChange = mov.quantity;
      } else if (mov.movement_type === 'sale' || mov.movement_type === 'adjustment_out' || mov.movement_type === 'transfer_out') {
        stockChange = -mov.quantity;
      }
      
      runningStock -= stockChange; // Subtract because we're going backwards
      
      evolution.unshift({
        date: mov.created_at.toISOString().split('T')[0],
        stock: runningStock,
        movement: stockChange,
        type: mov.movement_type
      });
    });

    return evolution;
  },

  async getUserActivity(filters: Filters) {
    const matchStage: any = {};
    
    if (filters.tenant_id) matchStage.tenant_id = filters.tenant_id;
    
    if (filters.date_from || filters.date_to) {
      matchStage.created_at = {};
      if (filters.date_from) matchStage.created_at.$gte = filters.date_from;
      if (filters.date_to) matchStage.created_at.$lte = filters.date_to;
    }

    const result = await StockMovement.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            user_id: "$created_by",
            dayOfWeek: { $dayOfWeek: "$created_at" },
            hour: { $hour: "$created_at" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          userId: "$_id.user_id",
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
