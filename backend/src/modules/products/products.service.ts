import { ProductUpdateDTO } from "./products.types";

const repo = require("./products.repository");

async function getAll() {
  return repo.findAll();
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: ProductUpdateDTO) {
  return repo.create(dto);
}

async function update(id: string, dto: ProductUpdateDTO) {
  return repo.update(id, dto);
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
