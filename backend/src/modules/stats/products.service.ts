const repository = require("./products.repository");

interface Filters {
  tenant_id?: string;
  date_from?: Date;
  date_to?: Date;
  page?: number;
  limit?: number;
}

async function getAddedByMonth(filters: Filters) {
  return repository.getAddedByMonth(filters);
}

async function getLowStock(filters: Filters) {
  return repository.getLowStock(filters);
}

async function getActiveInactiveCount(filters: Filters) {
  return repository.getActiveInactiveCount(filters);
}

async function getStockRotation(filters: Filters) {
  return repository.getStockRotation(filters);
}

module.exports = {
  getAddedByMonth,
  getLowStock,
  getActiveInactiveCount,
  getStockRotation
};

