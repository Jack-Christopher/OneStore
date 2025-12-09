export { }; // Empty export to force module scope

const service = require("./stockMovements.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const StockMovement = require("../../database/models/StockMovement");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll stockMovements:", error);
    return fail(res, "Failed to fetch stock movements", "INTERNAL_ERROR", 500);
  }
}

async function getByWarehouse(req: Req, res: Res) {
  try {
    const data = await service.getByWarehouse(req?.user?.id, req.params.warehouseId);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByWarehouse stockMovements:", error);
    return fail(res, "Failed to fetch stock movements by warehouse", "INTERNAL_ERROR", 500);
  }
}

async function getByProduct(req: Req, res: Res) {
  try {
    const data = await service.getByProduct(req?.user?.id, req.params.productId);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByProduct stockMovements:", error);
    return fail(res, "Failed to fetch stock movements by product", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const movement = await service.getOne(req.params.id);
    if (!movement) return fail(res, "Stock movement not found", "NOT_FOUND", 404);
    return ok(res, movement);
  } catch (error) {
    console.error("Error in getOne stockMovement:", error);
    return fail(res, "Failed to fetch stock movement", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const movement = await service.create(req.body);
    await auditCreate("StockMovement", movement, req);
    return ok(res, movement);
  } catch (error) {
    console.error("Error in create stockMovement:", error);
    return fail(res, "Stock movement couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const oldRecord = await StockMovement.findById(req.params.id);
    if (!oldRecord) return fail(res, "Stock movement not found", "NOT_FOUND", 404);
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Stock movement not found", "NOT_FOUND", 404);
    await auditUpdate("StockMovement", oldRecord, updated, req);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update stockMovement:", error);
    return fail(res, "Failed to update stock movement", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const oldRecord = await StockMovement.findById(req.params.id);
    if (!oldRecord) return fail(res, "Stock movement not found", "NOT_FOUND", 404);
    const result = await service.remove(req.params.id);
    await auditDelete("StockMovement", oldRecord, req);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove stockMovement:", error);
    return fail(res, "Failed to delete stock movement", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getByWarehouse, getByProduct, getOne, create, update, remove };

