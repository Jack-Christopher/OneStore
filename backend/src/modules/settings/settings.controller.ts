export { }; // Empty export to force module scope

const service = require("./settings.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAllSettings(req?.user?.id);
    return ok(res, data);
  } catch (error: any) {
    return fail(res, error.message || "Error fetching settings", "SETTINGS_ERROR", 500);
  }
}

async function bulkUpdate(req: Req, res: Res) {
  try {
    await service.bulkUpdateSettings(req?.user?.id, req.body);
    // Return all settings after update
    const allSettings = await service.getAllSettings(req?.user?.id);
    return ok(res, allSettings);
  } catch (error: any) {
    return fail(res, error.message || "Error updating settings", "SETTINGS_UPDATE_ERROR", 500);
  }
}

async function uploadLogo(req: Req, res: Res) {
  try {
    if (!req.file) {
      return fail(res, "No file uploaded", "NO_FILE", 400);
    }

    const filePath = `/uploads/logos/${req.file.filename}`;
    await service.updateSetting(req?.user?.id, "store_logo_path", filePath);

    return ok(res, { path: filePath });
  } catch (error: any) {
    return fail(res, error.message || "Error uploading logo", "LOGO_UPLOAD_ERROR", 500);
  }
}

async function getBaseCurrency(req: Req, res: Res) {
  try {
    const currency = await service.getBaseCurrency(req?.user?.id);
    return ok(res, { baseCurrency: currency });
  } catch (error: any) {
    return fail(res, error.message || "Error fetching base currency", "BASE_CURRENCY_ERROR", 500);
  }
}

async function setBaseCurrency(req: Req, res: Res) {
  try {
    const { currency } = req.body;
    if (!currency) {
      return fail(res, "Currency is required", "MISSING_CURRENCY", 400);
    }
    await service.setBaseCurrency(req?.user?.id, currency);
    return ok(res, { baseCurrency: currency });
  } catch (error: any) {
    return fail(res, error.message || "Error setting base currency", "SET_BASE_CURRENCY_ERROR", 400);
  }
}

async function getCurrencyRates(req: Req, res: Res) {
  try {
    const refresh = req.query.refresh === "true";
    const rates = await service.getCurrencyRates(req?.user?.id, refresh);
    return ok(res, { rates });
  } catch (error: any) {
    return fail(res, error.message || "Error fetching currency rates", "CURRENCY_RATES_ERROR", 500);
  }
}

module.exports = { getAll, bulkUpdate, uploadLogo, getBaseCurrency, setBaseCurrency, getCurrencyRates };

