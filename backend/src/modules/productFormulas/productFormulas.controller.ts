export { }; // Empty export to force module scope

const service = require("./productFormulas.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll productFormulas:", error);
    return fail(res, "Failed to fetch product formulas", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const productFormula = await service.getOne(req.params.id);
    if (!productFormula) return fail(res, "Product formula not found", "NOT_FOUND", 404);
    return ok(res, productFormula);
  } catch (error) {
    console.error("Error in getOne productFormula:", error);
    return fail(res, "Failed to fetch product formula", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const productFormula = await service.create(req.body);
    return ok(res, productFormula);
  } catch (error) {
    console.error("Error in create productFormula:", error);
    return fail(res, "Product formula couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Product formula not found", "NOT_FOUND", 404);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update productFormula:", error);
    return fail(res, "Failed to update product formula", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) return fail(res, "Product formula not found", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove productFormula:", error);
    return fail(res, "Failed to delete product formula", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getOne, create, update, remove };
