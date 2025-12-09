export { }; // Empty export to force module scope

const service = require("./suppliers.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const Supplier = require("../../database/models/Supplier");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll suppliers:", error);
    return fail(res, "Failed to fetch suppliers", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const supplier = await service.getOne(req.params.id);
    if (!supplier) return fail(res, "Supplier not found", "NOT_FOUND", 404);
    return ok(res, supplier);
  } catch (error) {
    console.error("Error in getOne supplier:", error);
    return fail(res, "Failed to fetch supplier", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const supplier = await service.create(req.body);
    await auditCreate("Supplier", supplier, req);
    return ok(res, supplier);
  } catch (error) {
    console.error("Error in create supplier:", error);
    return fail(res, "Supplier couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const oldRecord = await Supplier.findById(req.params.id);
    if (!oldRecord) return fail(res, "Supplier not found", "NOT_FOUND", 404);
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Supplier not found", "NOT_FOUND", 404);
    await auditUpdate("Supplier", oldRecord, updated, req);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update supplier:", error);
    return fail(res, "Failed to update supplier", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const oldRecord = await Supplier.findById(req.params.id);
    if (!oldRecord) return fail(res, "Supplier not found", "NOT_FOUND", 404);
    const result = await service.remove(req.params.id);
    await auditDelete("Supplier", oldRecord, req);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove supplier:", error);
    return fail(res, "Failed to delete supplier", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getOne, create, update, remove };

