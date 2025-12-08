const repository = require("./purchases.repository");

interface Filters {
  tenant_id?: string;
  user_id?: string;
  date_from?: Date;
  date_to?: Date;
  page?: number;
  limit?: number;
}

async function getSummary(filters: Filters) {
  return repository.getSummary(filters);
}

async function getByMonth(filters: Filters) {
  return repository.getByMonth(filters);
}

async function getAverageCostPerDay(filters: Filters) {
  return repository.getAverageCostPerDay(filters);
}

async function getBySupplier(filters: Filters) {
  return repository.getBySupplier(filters);
}

module.exports = {
  getSummary,
  getByMonth,
  getAverageCostPerDay,
  getBySupplier
};

