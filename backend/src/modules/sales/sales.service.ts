import { SaleUpdateDTO } from "./sales.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./sales.repository");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: SaleUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

async function update(id: string, dto: SaleUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function remove(id: string) {
  return repo.delete(id);
}



module.exports = {
  getAll,
  create,
  update,
  remove
};
