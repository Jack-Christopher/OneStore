import { WarehouseUpdateDTO } from "./warehouses.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./warehouses.repository");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: WarehouseUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

async function update(id: string, dto: WarehouseUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function remove(id: string) {
  return repo.delete(id);
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove
};

