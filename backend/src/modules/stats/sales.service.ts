const repository = require("./sales.repository");

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

async function getByDay(filters: Filters) {
  return repository.getByDay(filters);
}

async function getByMonth(filters: Filters) {
  return repository.getByMonth(filters);
}

async function getTopProducts(filters: Filters) {
  return repository.getTopProducts(filters);
}

async function getByPaymentMethod(filters: Filters) {
  return repository.getByPaymentMethod(filters);
}

async function getByHour(filters: Filters) {
  return repository.getByHour(filters);
}

async function getAverageTicketByDay(filters: Filters) {
  return repository.getAverageTicketByDay(filters);
}

async function getByWarehouse(filters: Filters) {
  return repository.getByWarehouse(filters);
}

async function getTopCustomers(filters: Filters) {
  return repository.getTopCustomers(filters);
}

async function getSalesByCategory(filters: Filters) {
  return repository.getSalesByCategory(filters);
}

async function getProductMargins(filters: Filters) {
  return repository.getProductMargins(filters);
}

module.exports = {
  getSummary,
  getByDay,
  getByMonth,
  getTopProducts,
  getByPaymentMethod,
  getByHour,
  getAverageTicketByDay,
  getByWarehouse,
  getTopCustomers,
  getSalesByCategory,
  getProductMargins
};

