export { }; // Empty export to force module scope

const service = require("./saleItems.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getAllbySaleId(req: Req, res: Res) {
  const saleItems = await service.getAllBySaleId(req.params.id);
  if (!saleItems) return fail(res, "Sale Items not found", 404);
  return ok(res, saleItems);
}

async function getOne(req: Req, res: Res) {
  const saleItem = await service.getOne(req.params.id);
  if (!saleItem) return fail(res, "Sale Item not found", 404);
  return ok(res, saleItem);
}

async function create(req: Req, res: Res) {
  const saleItem = await service.create(req.body);
  return ok(res, saleItem);
}

async function createMany(req: Req, res: Res) {
  try {
    const saleItems = await service.createMany(req.body);
    return ok(res, saleItems);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Sale items couldn't be created", 409);
  }

}


async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Sale Item not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Sale Item not found", 404);
  return ok(res, result);
}

module.exports = { getAll, getAllbySaleId, getOne, create, createMany, update, remove };
