export { };
const service = require("./exchangeRates.service");
const { ok, fail } = require("../../shared/utils/response");

async function getLatest(req: Req, res: Res) {
  try {
    const refresh = req.query.refresh === "true";
    const rate = refresh ? await service.syncLatest() : await service.getLatest();
    return ok(res, rate);
  } catch (error: any) {
    return fail(res, error.message || "No se pudo leer el tipo de cambio", "EXCHANGE_RATE_ERROR", 502);
  }
}

async function getByDate(req: Req, res: Res) {
  try {
    const raw = String(req.query.date || "");
    const date = raw ? new Date(raw) : new Date();
    if (Number.isNaN(date.getTime())) {
      return fail(res, "Fecha inválida", "INVALID_DATE", 400);
    }
    const rate = await service.getForDate(date);
    return ok(res, rate);
  } catch (error: any) {
    return fail(res, error.message || "No se pudo leer el tipo de cambio", "EXCHANGE_RATE_ERROR", 502);
  }
}

module.exports = { getLatest, getByDate };
