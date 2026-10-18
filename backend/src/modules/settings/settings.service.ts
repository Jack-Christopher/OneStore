import { BulkUpdateSettingsDTO } from "./settings.types";
import { toSnakeCase } from "../../shared/utils/object";

const repo = require("./settings.repository");
const exchangeRatesService = require("../exchangeRates/exchangeRates.service");

async function getAllSettings(user_id: string) {
  const settings = await repo.findAll(user_id);
  // Convert array to object for easier access
  const settingsObj: Record<string, any> = {};
  settings.forEach((setting: any) => {
    settingsObj[setting.key] = setting.value;
  });
  return settingsObj;
}

async function getSetting(user_id: string, key: string) {
  const setting = await repo.findByKey(user_id, key);
  return setting ? setting.value : null;
}

async function updateSetting(user_id: string, key: string, value: any, description?: string) {
  return repo.createOrUpdate(user_id, key, value, description);
}

async function bulkUpdateSettings(user_id: string, dto: BulkUpdateSettingsDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.bulkUpdate(user_id, formattedData);
}

async function getBaseCurrency(user_id: string) {
  return getSetting(user_id, "base_currency");
}

async function setBaseCurrency(user_id: string, currency: string) {
  // Check if base_currency is already set
  const existing = await getSetting(user_id, "base_currency");
  if (existing) {
    throw new Error("Base currency cannot be changed after initial setup");
  }

  // Validate currency code
  const allowedCurrencies = ["PEN", "USD", "EUR"];
  if (!allowedCurrencies.includes(currency.toUpperCase())) {
    throw new Error(`Invalid currency. Allowed values: ${allowedCurrencies.join(", ")}`);
  }

  return updateSetting(user_id, "base_currency", currency.toUpperCase(), "Base currency for the system (immutable after setup)");
}

async function getCurrencyRates(user_id: string, refresh: boolean = false) {
  const baseCurrency = await getBaseCurrency(user_id);
  if (!baseCurrency) {
    throw new Error("Base currency not set");
  }

  const rate = refresh
    ? await exchangeRatesService.syncLatest()
    : await exchangeRatesService.getLatest();

  return exchangeRatesService.quoteForBase(baseCurrency, rate);
}

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  bulkUpdateSettings,
  getBaseCurrency,
  setBaseCurrency,
  getCurrencyRates
};

