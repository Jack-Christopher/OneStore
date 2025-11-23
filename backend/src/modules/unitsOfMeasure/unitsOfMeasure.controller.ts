export { }; // Empty export to force module scope

const service = require("./unitsOfMeasure.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const unitOfMeasure = await service.getOne(req.params.id);
  if (!unitOfMeasure) return fail(res, "Unit Of Measure not found", 404);
  return ok(res, unitOfMeasure);
}

async function create(req: Req, res: Res) {
  const unitOfMeasure = await service.create(req.body);
  return ok(res, unitOfMeasure);
}
async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Unit Of Measure not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Unit Of Measure not found", 404);
  return ok(res, result);
}

module.exports = { getAll, getOne, create, update, remove };
