import { SaleItemUpdateDTO } from "./saleItems.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./saleItems.repository");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getAllBySaleId(sale_id: string) {
  return repo.findAllBySaleId(sale_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: SaleItemUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}


async function createMany(dtoArray: SaleItemUpdateDTO[]) {
  const formattedDataArray = dtoArray.map(dto => toSnakeCase(dto) );
  return repo.createMany(formattedDataArray);
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
