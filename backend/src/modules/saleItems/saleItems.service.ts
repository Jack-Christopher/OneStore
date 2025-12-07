import { SaleItemUpdateDTO } from "./saleItems.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./saleItems.repository");
const Sale = require("../../database/models/Sale");
const stockMovementsService = require("../stockMovements/stockMovements.service");
const warehouseProductsService = require("../warehouseProducts/warehouseProducts.service");
const WarehouseProduct = require("../../database/models/WarehouseProduct");

// Helper function to decrement stock from any available warehouse
async function decrementStockFromAnyWarehouse(tenantId: string, productId: string, quantity: number, preferredWarehouseId?: string) {
  // First try preferred warehouse
  if (preferredWarehouseId) {
    const wp = await WarehouseProduct.findOne({
      tenant_id: tenantId,
      warehouse_id: preferredWarehouseId,
      product_id: productId,
      quantity: { $gte: quantity }
    });

    if (wp) {
      return await warehouseProductsService.decrementQuantity(
        tenantId,
        preferredWarehouseId,
        productId,
        quantity
      );
    }
  }

  // Find any warehouse with enough stock
  const warehouseProduct = await WarehouseProduct.findOne({
    tenant_id: tenantId,
    product_id: productId,
    quantity: { $gte: quantity }
  }).sort({ quantity: -1 });

  if (warehouseProduct) {
    return await warehouseProductsService.decrementQuantity(
      tenantId,
      warehouseProduct.warehouse_id,
      productId,
      quantity
    );
  }

  // If no warehouse has enough, try to decrement from multiple warehouses
  const allWarehouseProducts = await WarehouseProduct.find({
    tenant_id: tenantId,
    product_id: productId,
    quantity: { $gt: 0 }
  }).sort({ quantity: -1 });

  let remainingQty = quantity;
  const decremented: any[] = [];

  for (const wp of allWarehouseProducts) {
    if (remainingQty <= 0) break;

    const decrementQty = Math.min(remainingQty, wp.quantity);
    await warehouseProductsService.decrementQuantity(
      tenantId,
      wp.warehouse_id,
      productId,
      decrementQty
    );
    
    decremented.push({ warehouseId: wp.warehouse_id, quantity: decrementQty });
    remainingQty -= decrementQty;
  }

  return remainingQty === 0;
}

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getAllBySaleId(sale_id: string) {
  return repo.findAllBySaleId(sale_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: SaleItemUpdateDTO, userId?: string) {
  const formattedData = toSnakeCase(dto);
  const saleItem = await repo.create(formattedData);

  // Get sale info to adjust stock
  if (dto.saleId) {
    const sale = await Sale.findById(dto.saleId);
    if (sale && sale.status === 'completed') {
      // Create stock movement (exit)
      await stockMovementsService.create({
        tenantId: dto.tenantId || sale.tenant_id,
        warehouseId: sale.warehouse_id,
        productId: dto.productId,
        movementType: 'sale',
        quantity: dto.quantity,
        relatedId: sale._id.toString(),
        comment: `Venta #${sale._id}`,
        createdBy: userId || sale.created_by
      });

      // Decrement warehouse product quantity from any available warehouse
      await decrementStockFromAnyWarehouse(
        dto.tenantId || sale.tenant_id,
        dto.productId,
        dto.quantity,
        sale.warehouse_id
      );
    }
  }

  return saleItem;
}


async function createMany(dtoArray: SaleItemUpdateDTO[], userId?: string) {
  if (!dtoArray || dtoArray.length === 0) {
    return [];
  }

  const formattedDataArray = dtoArray.map(dto => toSnakeCase(dto));
  const saleItems = await repo.createMany(formattedDataArray);

  // Adjust stock for all items
  if (saleItems && saleItems.length > 0) {
    const saleId = formattedDataArray[0].sale_id;
    if (saleId) {
      const sale = await Sale.findById(saleId);
      if (sale && sale.status === 'completed') {
        for (const item of formattedDataArray) {
          try {
            const tenantId = item.tenant_id || sale.tenant_id;
            const warehouseId = sale.warehouse_id;
            const productId = item.product_id;
            const quantity = item.quantity;

            if (!tenantId || !warehouseId || !productId || !quantity) {
              console.error(`Missing required fields for stock adjustment: tenantId=${tenantId}, warehouseId=${warehouseId}, productId=${productId}, quantity=${quantity}`);
              continue;
            }

            // Create stock movement (exit)
            await stockMovementsService.create({
              tenantId: tenantId,
              warehouseId: warehouseId,
              productId: productId,
              movementType: 'sale',
              quantity: quantity,
              relatedId: sale._id.toString(),
              comment: `Venta #${sale._id}`,
              createdBy: userId || sale.created_by
            });

            // Decrement warehouse product quantity from any available warehouse
            await decrementStockFromAnyWarehouse(
              tenantId,
              productId,
              quantity,
              warehouseId
            );
          } catch (error: any) {
            console.error(`Error adjusting stock for item ${item.product_id}:`, error?.message || error);
            // Continue with other items even if one fails
          }
        }
      }
    }
  }

  return saleItems;
}

async function update(id: string, dto: SaleItemUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function remove(id: string) {
  return repo.delete(id);
}



module.exports = {
  getAll,
  getAllBySaleId,
  getOne,
  create,
  createMany,
  update,
  remove
};
