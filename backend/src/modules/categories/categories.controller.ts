export {}; // Empty export to force module scope

const service = require("./categories.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll();
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const category = await service.getOne(req.params.id);
  if (!category) return fail(res, "Category not found", 404);
  return ok(res, category);
}

async function create(req: Req, res: Res) {
  console.log("Creating category with data:", req.body);
  const category = await service.create(req.body);
  return ok(res, category);
}
async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Category not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Category not found", 404);
  return ok(res, result);
}

module.exports = { getAll, getOne, create, update, remove };
