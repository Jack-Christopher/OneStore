export { }; // Empty export to force module scope

const service = require("./warehouses.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const Warehouse = require("../../database/models/Warehouse");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll warehouses:", error);
    return fail(res, "Failed to fetch warehouses", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const warehouse = await service.getOne(req.params.id);
    if (!warehouse) return fail(res, "Warehouse not found", "NOT_FOUND", 404);
    return ok(res, warehouse);
  } catch (error) {
    console.error("Error in getOne warehouse:", error);
    return fail(res, "Failed to fetch warehouse", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const warehouse = await service.create(req.body);
    await auditCreate("Warehouse", warehouse, req);
    return ok(res, warehouse);
  } catch (error) {
    console.error("Error in create warehouse:", error);
    return fail(res, "Warehouse couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const oldRecord = await Warehouse.findById(req.params.id);
    if (!oldRecord) return fail(res, "Warehouse not found", "NOT_FOUND", 404);
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Warehouse not found", "NOT_FOUND", 404);
    await auditUpdate("Warehouse", oldRecord, updated, req);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update warehouse:", error);
    return fail(res, "Failed to update warehouse", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const oldRecord = await Warehouse.findById(req.params.id);
    if (!oldRecord) return fail(res, "Warehouse not found", "NOT_FOUND", 404);
    const result = await service.remove(req.params.id);
    await auditDelete("Warehouse", oldRecord, req);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove warehouse:", error);
    return fail(res, "Failed to delete warehouse", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getOne, create, update, remove };

