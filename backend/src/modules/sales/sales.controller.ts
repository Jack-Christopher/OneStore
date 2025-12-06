export { }; // Empty export to force module scope

const service = require("./sales.service");
const { ok, fail } = require("../../shared/utils/response");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const sale = await service.getOne(req.params.id);
  if (!sale) return fail(res, "Sale not found", 404);
  return ok(res, sale);
}

async function create(req: Req, res: Res) {
  try {
    const sale = await service.create(req.body);
    return ok(res, sale);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Sale couldn't be created", 409);
  }
}

async function createWithItems(req: Req, res: Res) {
  try {
    const sale = await service.createWithItems(req.body, req?.user?.id);
    return ok(res, sale);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Sale couldn't be created", 409);
  }
}

async function update(req: Req, res: Res) {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Sale not found", 404);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const result = await service.remove(req.params.id);
  if (!result) return fail(res, "Sale not found", 404);
  return ok(res, result);
}

async function cancelSale(req: Req, res: Res) {
  try {
    const result = await service.cancelSale(req.params.id, req?.user?.id);
    if (!result) return fail(res, "Sale not found", 404);
    return ok(res, result);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Sale couldn't be canceled", 409);
  }
}

module.exports = { getAll, getOne, create, createWithItems, update, remove, cancelSale };
