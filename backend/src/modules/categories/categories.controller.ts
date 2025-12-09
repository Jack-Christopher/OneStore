export { }; // Empty export to force module scope

const service = require("./categories.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const Category = require("../../database/models/Category");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll categories:", error);
    return fail(res, "Failed to fetch categories", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const category = await service.getOne(req.params.id);
    if (!category) return fail(res, "Category not found", "NOT_FOUND", 404);
    return ok(res, category);
  } catch (error) {
    console.error("Error in getOne category:", error);
    return fail(res, "Failed to fetch category", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const category = await service.create(req.body);
    await auditCreate("Category", category, req);
    return ok(res, category);
  } catch (error) {
    console.error("Error in create category:", error);
    return fail(res, "Category couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const oldRecord = await Category.findById(req.params.id);
    if (!oldRecord) return fail(res, "Category not found", "NOT_FOUND", 404);
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Category not found", "NOT_FOUND", 404);
    await auditUpdate("Category", oldRecord, updated, req);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update category:", error);
    return fail(res, "Failed to update category", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const oldRecord = await Category.findById(req.params.id);
    if (!oldRecord) return fail(res, "Category not found", "NOT_FOUND", 404);
    const result = await service.remove(req.params.id);
    await auditDelete("Category", oldRecord, req);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove category:", error);
    return fail(res, "Failed to delete category", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getOne, create, update, remove };
