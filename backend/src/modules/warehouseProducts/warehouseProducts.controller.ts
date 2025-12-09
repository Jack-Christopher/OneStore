export { }; // Empty export to force module scope

const service = require("./warehouseProducts.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll warehouseProducts:", error);
    return fail(res, "Failed to fetch warehouse products", "INTERNAL_ERROR", 500);
  }
}

async function getByWarehouse(req: Req, res: Res) {
  try {
    const data = await service.getByWarehouse(req?.user?.id, req.params.warehouseId);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByWarehouse warehouseProducts:", error);
    return fail(res, "Failed to fetch warehouse products by warehouse", "INTERNAL_ERROR", 500);
  }
}

async function getByProduct(req: Req, res: Res) {
  try {
    const data = await service.getByProduct(req?.user?.id, req.params.productId);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByProduct warehouseProducts:", error);
    return fail(res, "Failed to fetch warehouse products by product", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const product = await service.getOne(req.params.id);
    if (!product) return fail(res, "Warehouse product not found", "NOT_FOUND", 404);
    return ok(res, product);
  } catch (error) {
    console.error("Error in getOne warehouseProduct:", error);
    return fail(res, "Failed to fetch warehouse product", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const product = await service.create(req.body);
    return ok(res, product);
  } catch (error) {
    console.error("Error in create warehouseProduct:", error);
    return fail(res, "Warehouse product couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Warehouse product not found", "NOT_FOUND", 404);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update warehouseProduct:", error);
    return fail(res, "Failed to update warehouse product", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) return fail(res, "Warehouse product not found", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove warehouseProduct:", error);
    return fail(res, "Failed to delete warehouse product", "DELETE_ERROR", 500);
  }
}

async function getLowStock(req: Req, res: Res) {
  try {
    const data = await service.getLowStock(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getLowStock warehouseProducts:", error);
    return fail(res, "Failed to fetch low stock products", "INTERNAL_ERROR", 500);
  }
}

module.exports = { getAll, getByWarehouse, getByProduct, getOne, create, update, remove, getLowStock };

