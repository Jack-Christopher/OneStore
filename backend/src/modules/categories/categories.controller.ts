export { }; // Empty export to force module scope

const service = require("./categories.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const Category = require("../../database/models/Category");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const category = await service.getOne(req.params.id);
  if (!category) return fail(res, "Category not found", 404);
  return ok(res, category);
}

async function create(req: Req, res: Res) {
  const category = await service.create(req.body);
  await auditCreate("Category", category, req);
  return ok(res, category);
}
async function update(req: Req, res: Res) {
  const oldRecord = await Category.findById(req.params.id);
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Category not found", 404);
  await auditUpdate("Category", oldRecord, updated, req);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const oldRecord = await Category.findById(req.params.id);
  if (!oldRecord) return fail(res, "Category not found", 404);
  const result = await service.remove(req.params.id);
  await auditDelete("Category", oldRecord, req);
  return ok(res, result);
}

module.exports = { getAll, getOne, create, update, remove };
