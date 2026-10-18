export { };
const service = require("./ruc.service");
const { ok, fail } = require("../../shared/utils/response");

async function lookup(req: Req, res: Res) {
  try {
    const data = await service.lookup(req.params.ruc);
    return ok(res, data);
  } catch (error: any) {
    const status = error.status || 502;
    return fail(res, error.message || "No se pudo consultar el RUC", "RUC_LOOKUP_ERROR", status);
  }
}

module.exports = { lookup };
