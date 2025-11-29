export { }; // Empty export to force module scope

const service = require("./products.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getMostSold(req: Req, res: Res) {
  const data = await service.getMostSold(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const product = await service.getOne(req.params.id);
  if (!product) return fail(res, "Product not found", 404);
  return ok(res, product);
}

async function create(req: Req, res: Res) {
  try {
    const product = await service.create(req.body);
    return ok(res, product);

  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Product couldn't be created", 409);
  }
}
async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Product not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Product not found", 404);
  return ok(res, result);
}

module.exports = { getAll, getMostSold, getOne, create, update, remove };
