export { }; // Empty export to force module scope

const service = require("./warehouses.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const Warehouse = require("../../database/models/Warehouse");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const warehouse = await service.getOne(req.params.id);
  if (!warehouse) return fail(res, "Warehouse not found", 404);
  return ok(res, warehouse);
}

async function create(req: Req, res: Res) {
  try {
    const warehouse = await service.create(req.body);
    await auditCreate("Warehouse", warehouse, req);
    return ok(res, warehouse);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Warehouse couldn't be created", 409);
  }
}

async function update(req: Req, res: Res) {
  const oldRecord = await Warehouse.findById(req.params.id);
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Warehouse not found", 404);
  await auditUpdate("Warehouse", oldRecord, updated, req);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const oldRecord = await Warehouse.findById(req.params.id);
  if (!oldRecord) return fail(res, "Warehouse not found", 404);
  const result = await service.remove(req.params.id);
  await auditDelete("Warehouse", oldRecord, req);
  return ok(res, result);
}

module.exports = { getAll, getOne, create, update, remove };

