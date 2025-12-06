export { }; // Empty export to force module scope

const service = require("./warehouseProducts.service");
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
  const product = await service.getOne(req.params.id);
  if (!product) return fail(res, "Warehouse product not found", 404);
  return ok(res, product);
}

async function create(req: Req, res: Res) {
  try {
    const product = await service.create(req.body);
    return ok(res, product);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Warehouse product couldn't be created", 409);
  }
}

async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Warehouse product not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Warehouse product not found", 404);
  return ok(res, result);
}

async function getLowStock(req: Req, res: Res) {
  const data = await service.getLowStock(req?.user?.id);
  return ok(res, data);
}

module.exports = { getAll, getByWarehouse, getByProduct, getOne, create, update, remove, getLowStock };

