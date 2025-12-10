export { }; // Empty export to force module scope

const service = require("./products.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const Product = require("../../database/models/Product");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll products:", error);
    return fail(res, "Failed to fetch products", "INTERNAL_ERROR", 500);
  }
}

async function getMostSold(req: Req, res: Res) {
  try {
    const data = await service.getMostSold(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getMostSold products:", error);
    return fail(res, "Failed to fetch most sold products", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const product = await service.getOne(req.params.id);
    if (!product) return fail(res, "Product not found", "NOT_FOUND", 404);
    return ok(res, product);
  } catch (error) {
    console.error("Error in getOne product:", error);
    return fail(res, "Failed to fetch product", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const product = await service.create(req.body);
    await auditCreate("Product", product, req);
    return ok(res, product);

  } catch (error) {
    console.error("Error in create product:", error);
    const { handleMongoError } = require("../../shared/utils/mongoErrorHandler");
    const mongoError = handleMongoError(error, "product");
    if (mongoError) {
      return fail(res, mongoError.message, mongoError.code, mongoError.status);
    }
    return fail(res, "Product couldn't be created", "CREATE_ERROR", 409);
  }
}
async function update(req: Req, res: Res) {
  try {
    const oldRecord = await Product.findById(req.params.id);
    if (!oldRecord) return fail(res, "Product not found", "NOT_FOUND", 404);
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Product not found", "NOT_FOUND", 404);
    await auditUpdate("Product", oldRecord, updated, req);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update product:", error);
    const { handleMongoError } = require("../../shared/utils/mongoErrorHandler");
    const mongoError = handleMongoError(error, "product");
    if (mongoError) {
      return fail(res, mongoError.message, mongoError.code, mongoError.status);
    }
    return fail(res, "Failed to update product", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const oldRecord = await Product.findById(req.params.id);
    if (!oldRecord) return fail(res, "Product not found", "NOT_FOUND", 404);
    const result = await service.remove(req.params.id);
    await auditDelete("Product", oldRecord, req);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove product:", error);
    return fail(res, "Failed to delete product", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getMostSold, getOne, create, update, remove };
