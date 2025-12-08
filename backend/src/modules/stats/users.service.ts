const repository = require("./users.repository");

interface Filters {
  tenant_id?: string;
}

async function getCount(filters: Filters) {
  return repository.getCount(filters);
}

async function getActiveCount(filters: Filters) {
  return repository.getActiveCount(filters);
}

async function getAddedByMonth(filters: Filters) {
  return repository.getAddedByMonth(filters);
}

module.exports = {
  getCount,
  getActiveCount,
  getAddedByMonth
};

