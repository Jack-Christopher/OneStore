import { PurchaseOrderUpdateDTO, PurchaseOrderItemDTO, CreatePurchaseOrderWithItemsDTO } from "./purchaseOrders.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./purchaseOrders.repository");
const stockMovementsService = require("../stockMovements/stockMovements.service");
const warehouseProductsService = require("../warehouseProducts/warehouseProducts.service");
const settingsService = require("../settings/settings.service");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: PurchaseOrderUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

async function createWithItems(dto: CreatePurchaseOrderWithItemsDTO, userId: string) {
  // Get base currency
  const baseCurrency = await settingsService.getBaseCurrency(userId);
  if (!baseCurrency) {
    throw new Error("Base currency must be set before creating transactions");
  }

  // Validate and process currency fields
  const orderData: any = toSnakeCase(dto.order);
  
  // Check if using foreign currency
  const useForeignCurrency = dto.order.useForeignCurrency || false;
  
  if (useForeignCurrency) {
    // Validate required fields
    if (!dto.order.currencyCode) {
      throw new Error("currency_code is required when using foreign currency");
    }
    if (!dto.order.exchangeRate || dto.order.exchangeRate <= 0) {
      throw new Error("exchange_rate must be greater than 0");
    }
    if (dto.order.totalOriginal === undefined || dto.order.totalOriginal === null) {
      throw new Error("total_original is required when using foreign currency");
    }
    
    orderData.currency_code = dto.order.currencyCode.toUpperCase();
    orderData.exchange_rate = dto.order.exchangeRate;
    // total_original is the sum of all item subtotals in alternative currency
    // total_base is total_original converted back to base currency (divide by exchange rate)
    orderData.total_original = dto.order.totalOriginal;
    orderData.total_base = dto.order.totalOriginal / dto.order.exchangeRate;
  } else {
    // Use base currency
    orderData.currency_code = baseCurrency;
    orderData.exchange_rate = 1;
    orderData.total_original = orderData.total_amount || 0;
    orderData.total_base = orderData.total_amount || 0;
  }
  
  // Keep total_amount for backward compatibility
  orderData.total_amount = orderData.total_base;

  const order = await repo.create(orderData);

  if (dto.items && dto.items.length > 0) {
    const itemsData = dto.items.map(item => {
      const itemData: any = toSnakeCase(item);
      itemData.purchase_order_id = order._id.toString();
      
      // Calculate currency fields for items
      // item.unitPrice and item.subtotal are in base currency
      if (useForeignCurrency) {
        // Convert from base to alternative: multiply by exchange rate
        itemData.unit_cost_original = (item.unitPrice || 0) * orderData.exchange_rate;
        itemData.unit_cost_base = item.unitPrice || 0;
      } else {
        itemData.unit_cost_original = item.unitPrice || 0;
        itemData.unit_cost_base = item.unitPrice || 0;
      }
      
      // Keep unit_price for backward compatibility
      itemData.unit_price = itemData.unit_cost_base;
      
      return itemData;
    });
    await repo.createManyItems(itemsData);
  }

  return order;
}

async function update(id: string, dto: PurchaseOrderUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function remove(id: string) {
  await repo.deleteItemsByOrderId(id);
  return repo.delete(id);
}

async function receiveOrder(id: string, userId: string) {
  const order = await repo.findById(id);
  if (!order) return null;
  if (order.status === 'received') return order;

  const items = await repo.findItemsByOrderId(id);

  // Create stock movements and update warehouse products for each item
  for (const item of items) {
    // Create stock movement (entry)
    await stockMovementsService.create({
      tenantId: order.tenant_id,
      warehouseId: order.warehouse_id,
      productId: item.product_id,
      movementType: 'purchase',
      quantity: item.quantity,
      relatedId: order._id.toString(),
      comment: `Recepción de orden de compra #${order.reference_number || order._id}`,
      createdBy: userId
    });

    // Update warehouse product quantity
    await warehouseProductsService.incrementQuantity(
      order.tenant_id,
      order.warehouse_id,
      item.product_id,
      item.quantity
    );

    // Update received quantity in item
    await repo.updateItem(item._id.toString(), {
      ...item.toObject(),
      received_quantity: item.quantity
    });
  }

  // Update order status
  return repo.update(id, { status: 'received', updated_by: userId });
}

// Items functions
async function getItemsByOrderId(orderId: string) {
  return repo.findItemsByOrderId(orderId);
}

async function createItem(dto: PurchaseOrderItemDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.createItem(formattedData);
}

async function createManyItems(dtoArray: PurchaseOrderItemDTO[]) {
  const formattedDataArray = dtoArray.map(dto => toSnakeCase(dto));
  return repo.createManyItems(formattedDataArray);
}

async function updateItem(id: string, dto: PurchaseOrderItemDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.updateItem(id, formattedData);
}

async function removeItem(id: string) {
  return repo.deleteItem(id);
}

module.exports = {
  getAll,
  getOne,
  create,
  createWithItems,
  update,
  remove,
  receiveOrder,
  getItemsByOrderId,
  createItem,
  createManyItems,
  updateItem,
  removeItem
};

