export { }; // Empty export to force module scope

const service = require("./unitsOfMeasure.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll unitsOfMeasure:", error);
    return fail(res, "Failed to fetch units of measure", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const unitOfMeasure = await service.getOne(req.params.id);
    if (!unitOfMeasure) return fail(res, "Unit Of Measure not found", "NOT_FOUND", 404);
    return ok(res, unitOfMeasure);
  } catch (error) {
    console.error("Error in getOne unitOfMeasure:", error);
    return fail(res, "Failed to fetch unit of measure", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const unitOfMeasure = await service.create(req.body);
    return ok(res, unitOfMeasure);
  } catch (error) {
    console.error("Error in create unitOfMeasure:", error);
    return fail(res, "Unit of measure couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Unit Of Measure not found", "NOT_FOUND", 404);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update unitOfMeasure:", error);
    return fail(res, "Failed to update unit of measure", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) return fail(res, "Unit Of Measure not found", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove unitOfMeasure:", error);
    return fail(res, "Failed to delete unit of measure", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getOne, create, update, remove };
