export { }; // Empty export to force module scope

const service = require("./saleItems.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll saleItems:", error);
    return fail(res, "Failed to fetch sale items", "INTERNAL_ERROR", 500);
  }
}

async function getAllbySaleId(req: Req, res: Res) {
  try {
    const saleItems = await service.getAllBySaleId(req.params.id);
    if (!saleItems) return fail(res, "Sale Items not found", "NOT_FOUND", 404);
    return ok(res, saleItems);
  } catch (error) {
    console.error("Error in getAllbySaleId:", error);
    return fail(res, "Failed to fetch sale items", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const saleItem = await service.getOne(req.params.id);
    if (!saleItem) return fail(res, "Sale Item not found", "NOT_FOUND", 404);
    return ok(res, saleItem);
  } catch (error) {
    console.error("Error in getOne saleItem:", error);
    return fail(res, "Failed to fetch sale item", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const saleItem = await service.create(req.body, req?.user?.id);
    return ok(res, saleItem);
  } catch (error) {
    console.error("Error in create saleItem:", error);
    return fail(res, "Sale item couldn't be created", "CREATE_ERROR", 409);
  }
}

async function createMany(req: Req, res: Res) {
  try {
    const saleItems = await service.createMany(req.body, req?.user?.id);
    return ok(res, saleItems);
  } catch (error) {
    console.error("Error in createMany saleItems:", error);
    return fail(res, "Sale items couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Sale Item not found", "NOT_FOUND", 404);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update saleItem:", error);
    return fail(res, "Failed to update sale item", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) return fail(res, "Sale Item not found", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove saleItem:", error);
    return fail(res, "Failed to delete sale item", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getAllbySaleId, getOne, create, createMany, update, remove };
