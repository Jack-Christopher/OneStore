import { StockMovementUpdateDTO, StockMovementDTO } from "./stockMovements.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./stockMovements.repository");

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

async function create(dto: StockMovementDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

async function createMany(dtoArray: StockMovementDTO[]) {
  const formattedDataArray = dtoArray.map(dto => toSnakeCase(dto));
  return repo.createMany(formattedDataArray);
}

async function update(id: string, dto: StockMovementUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function remove(id: string) {
  return repo.delete(id);
}

module.exports = {
  getAll,
  getByWarehouse,
  getByProduct,
  getOne,
  create,
  createMany,
  update,
  remove
};

