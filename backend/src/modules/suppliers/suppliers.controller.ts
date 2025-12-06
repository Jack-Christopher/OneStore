export { }; // Empty export to force module scope

const service = require("./suppliers.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const supplier = await service.getOne(req.params.id);
  if (!supplier) return fail(res, "Supplier not found", 404);
  return ok(res, supplier);
}

async function create(req: Req, res: Res) {
  try {
    const supplier = await service.create(req.body);
    return ok(res, supplier);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Supplier couldn't be created", 409);
  }
}

async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Supplier not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Supplier not found", 404);
  return ok(res, result);
}

module.exports = { getAll, getOne, create, update, remove };

