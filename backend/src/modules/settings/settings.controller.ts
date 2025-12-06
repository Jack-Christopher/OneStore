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

module.exports = { getAll, bulkUpdate, uploadLogo };

