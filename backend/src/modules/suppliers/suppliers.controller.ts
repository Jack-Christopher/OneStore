export { }; // Empty export to force module scope

const service = require("./suppliers.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const Supplier = require("../../database/models/Supplier");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const supplier = await service.getOne(req.params.id);
  if (!supplier) return fail(res, "Supplier not found", 404);
  return ok(res, supplier);
}

async function create(req: Req, res: Res) {
  try {
    const supplier = await service.create(req.body);
    await auditCreate("Supplier", supplier, req);
    return ok(res, supplier);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Supplier couldn't be created", 409);
  }
}

async function update(req: Req, res: Res) {
  const oldRecord = await Supplier.findById(req.params.id);
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Supplier not found", 404);
  await auditUpdate("Supplier", oldRecord, updated, req);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const oldRecord = await Supplier.findById(req.params.id);
  if (!oldRecord) return fail(res, "Supplier not found", 404);
  const result = await service.remove(req.params.id);
  await auditDelete("Supplier", oldRecord, req);
  return ok(res, result);
}

module.exports = { getAll, getOne, create, update, remove };

