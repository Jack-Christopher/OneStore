const repository = require("./stock.repository");

interface Filters {
  tenant_id?: string;
  date_from?: Date;
  date_to?: Date;
  product_id?: string;
}

async function getStockValue(filters: Filters) {
  return repository.getStockValue(filters);
}

async function getMovementTypesFrequency(filters: Filters) {
  return repository.getMovementTypesFrequency(filters);
}

async function getInventoryEvolution(filters: Filters) {
  return repository.getInventoryEvolution(filters);
}

async function getUserActivity(filters: Filters) {
  return repository.getUserActivity(filters);
}

module.exports = {
  getStockValue,
  getMovementTypesFrequency,
  getInventoryEvolution,
  getUserActivity
};

