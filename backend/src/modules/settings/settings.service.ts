import { BulkUpdateSettingsDTO } from "./settings.types";
import { toSnakeCase } from "../../shared/utils/object";

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

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  bulkUpdateSettings
};

