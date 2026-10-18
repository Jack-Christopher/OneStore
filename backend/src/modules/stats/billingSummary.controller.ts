export { };
const service = require("./billingSummary.service");
const { ok, fail } = require("../../shared/utils/response");

async function getDocumentSummary(req: Req, res: Res) {
  try {
    const tenantId = req.user?.role === "admin" && req.query.tenant_id
      ? String(req.query.tenant_id)
      : req.user?.tenant_id;

    if (!tenantId || tenantId === "orphan") {
      return fail(res, "Tenant no disponible", "TENANT_REQUIRED", 400);
    }

    const data = await service.getDocumentSummary(tenantId);
    return ok(res, data);
  } catch (error) {
    console.error("Error in document summary:", error);
    return fail(res, "No se pudo armar el resumen de comprobantes", "INTERNAL_ERROR", 500);
  }
}

module.exports = { getDocumentSummary };
