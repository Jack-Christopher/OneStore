import { ProductFormulaUpdateDTO } from "./productFormulas.types";
import { toSnakeCase } from "../../shared/utils/object";
import { Double } from 'mongodb';

const repo = require("./productFormulas.repository");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getMostSold(user_id: string) {
  return repo.findMostSold(user_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: ProductFormulaUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  console.log("formattedData create", formattedData);
  return repo.create(formattedData);
}

async function update(id: string, dto: ProductFormulaUpdateDTO) {
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
