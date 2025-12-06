import { PurchaseOrderUpdateDTO, PurchaseOrderItemDTO, CreatePurchaseOrderWithItemsDTO } from "./purchaseOrders.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./purchaseOrders.repository");
const stockMovementsService = require("../stockMovements/stockMovements.service");
const warehouseProductsService = require("../warehouseProducts/warehouseProducts.service");

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

async function createWithItems(dto: CreatePurchaseOrderWithItemsDTO) {
  const orderData = toSnakeCase(dto.order);
  const order = await repo.create(orderData);

  if (dto.items && dto.items.length > 0) {
    const itemsData = dto.items.map(item => ({
      ...toSnakeCase(item),
      purchase_order_id: order._id.toString()
    }));
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

