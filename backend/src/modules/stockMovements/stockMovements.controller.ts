export { }; // Empty export to force module scope

const service = require("./stockMovements.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getByWarehouse(req: Req, res: Res) {
  const data = await service.getByWarehouse(req?.user?.id, req.params.warehouseId);
  return ok(res, data);
}

async function getByProduct(req: Req, res: Res) {
  const data = await service.getByProduct(req?.user?.id, req.params.productId);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const movement = await service.getOne(req.params.id);
  if (!movement) return fail(res, "Stock movement not found", 404);
  return ok(res, movement);
}

async function create(req: Req, res: Res) {
  try {
    const movement = await service.create(req.body);
    return ok(res, movement);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Stock movement couldn't be created", 409);
  }
}

async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Stock movement not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Stock movement not found", 404);
  return ok(res, result);
}

module.exports = { getAll, getByWarehouse, getByProduct, getOne, create, update, remove };

