import { WarehouseProductUpdateDTO } from "./warehouseProducts.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./warehouseProducts.repository");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getByWarehouse(user_id: string, warehouseId: string) {
  return repo.findByWarehouse(user_id, warehouseId);
}

async function getByProduct(user_id: string, productId: string) {
  return repo.findByProduct(user_id, productId);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function getByWarehouseAndProduct(tenantId: string, warehouseId: string, productId: string) {
  return repo.findByWarehouseAndProduct(tenantId, warehouseId, productId);
}

async function create(dto: WarehouseProductUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

async function update(id: string, dto: WarehouseProductUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function incrementQuantity(tenantId: string, warehouseId: string, productId: string, quantity: number) {
  return repo.incrementQuantity(tenantId, warehouseId, productId, quantity);
}

async function decrementQuantity(tenantId: string, warehouseId: string, productId: string, quantity: number) {
  return repo.decrementQuantity(tenantId, warehouseId, productId, quantity);
}

async function remove(id: string) {
  return repo.delete(id);
}

async function getLowStock(user_id: string) {
  return repo.findLowStock(user_id);
}

module.exports = {
  getAll,
  getByWarehouse,
  getByProduct,
  getByWarehouseAndProduct,
  getOne,
  create,
  update,
  incrementQuantity,
  decrementQuantity,
  remove,
  getLowStock
};

