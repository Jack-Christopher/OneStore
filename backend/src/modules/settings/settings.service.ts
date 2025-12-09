import { BulkUpdateSettingsDTO } from "./settings.types";
import { toSnakeCase } from "../../shared/utils/object";
import axios from "axios";

const repo = require("./settings.repository");

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

  const cachedData = await getSetting(user_id, "currency_api_cache");
  const cachedTimestamp = await getSetting(user_id, "currency_api_timestamp");

  // Check if cache is valid (24 hours)
  const now = new Date();
  const cacheAge = cachedTimestamp ? (now.getTime() - new Date(cachedTimestamp).getTime()) / (1000 * 60 * 60) : 24;

  if (!refresh && cachedData && cacheAge < 24) {
    return cachedData;
  }

  // Fetch from API
  try {
    const response = await axios.get(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency.toLowerCase()}.json`
    );

    const rates = response.data[baseCurrency.toLowerCase()];

    // Store in cache
    await updateSetting(user_id, "currency_api_cache", rates);
    await updateSetting(user_id, "currency_api_timestamp", now.toISOString());

    return rates;
  } catch (error: any) {
    // If API fails and we have cached data, return cached data
    if (cachedData) {
      return cachedData;
    }
    throw new Error(`Failed to fetch currency rates: ${error.message}`);
  }
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

