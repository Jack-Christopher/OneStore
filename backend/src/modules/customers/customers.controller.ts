export { }; // Empty export to force module scope

const service = require("./customers.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll customers:", error);
    return fail(res, "Failed to fetch customers", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const customer = await service.getOne(req.params.id);
    if (!customer) return fail(res, "Customer not found", "NOT_FOUND", 404);
    return ok(res, customer);
  } catch (error) {
    console.error("Error in getOne customer:", error);
    return fail(res, "Failed to fetch customer", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const customer = await service.create(req.body);
    return ok(res, customer);
  } catch (error) {
    console.error("Error in create customer:", error);
    return fail(res, "Customer couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Customer not found", "NOT_FOUND", 404);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update customer:", error);
    return fail(res, "Failed to update customer", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const result = await service.remove(req.params.id);
    if (!result) return fail(res, "Customer not found", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove customer:", error);
    return fail(res, "Failed to delete customer", "DELETE_ERROR", 500);
  }
}

module.exports = { getAll, getOne, create, update, remove };

