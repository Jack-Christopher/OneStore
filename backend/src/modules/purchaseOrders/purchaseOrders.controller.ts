export { }; // Empty export to force module scope

const service = require("./purchaseOrders.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const PurchaseOrder = require("../../database/models/PurchaseOrder");

async function getAll(req: Req, res: Res) {
  const data = await service.getAll(req?.user?.id);
  return ok(res, data);
}

async function getOne(req: Req, res: Res) {
  const order = await service.getOne(req.params.id);
  if (!order) return fail(res, "Purchase order not found", 404);
  return ok(res, order);
}

async function create(req: Req, res: Res) {
  try {
    const order = await service.create(req.body);
    await auditCreate("PurchaseOrder", order, req);
    return ok(res, order);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Purchase order couldn't be created", 409);
  }
}

async function createWithItems(req: Req, res: Res) {
  try {
    const order = await service.createWithItems(req.body, req?.user?.id);
    await auditCreate("PurchaseOrder", order, req);
    return ok(res, order);
  } catch (error: any) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, error.message || "Purchase order couldn't be created", 409);
  }
}

async function update(req: Req, res: Res) {
  const oldRecord = await PurchaseOrder.findById(req.params.id);
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return fail(res, "Purchase order not found", 404);
  await auditUpdate("PurchaseOrder", oldRecord, updated, req);
  return ok(res, updated);
}

async function remove(req: Req, res: Res) {
  const oldRecord = await PurchaseOrder.findById(req.params.id);
  if (!oldRecord) return fail(res, "Purchase order not found", 404);
  const result = await service.remove(req.params.id);
  await auditDelete("PurchaseOrder", oldRecord, req);
  return ok(res, result);
}

async function receiveOrder(req: Req, res: Res) {
  try {
    const result = await service.receiveOrder(req.params.id, req?.user?.id);
    if (!result) return fail(res, "Purchase order not found", 404);
    return ok(res, result);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Purchase order couldn't be received", 409);
  }
}

// Items
async function getItemsByOrderId(req: Req, res: Res) {
  const items = await service.getItemsByOrderId(req.params.id);
  return ok(res, items);
}

async function createItem(req: Req, res: Res) {
  try {
    const item = await service.createItem(req.body);
    return ok(res, item);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Purchase order item couldn't be created", 409);
  }
}

async function createManyItems(req: Req, res: Res) {
  try {
    const items = await service.createManyItems(req.body);
    return ok(res, items);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Purchase order items couldn't be created", 409);
  }
}

async function updateItem(req: Req, res: Res) {
  const updated = await service.updateItem(req.params.itemId, req.body);
  if (!updated) return fail(res, "Purchase order item not found", 404);
  return ok(res, updated);
}

async function removeItem(req: Req, res: Res) {
  const result = await service.removeItem(req.params.itemId);
  if (!result) return fail(res, "Purchase order item not found", 404);
  return ok(res, result);
}

module.exports = {
  getAll,
  getOne,
  create,
  createWithItems,
  update,
  remove,
  receiveOrder,
  getItemsByOrderId,
  createItem,
  createManyItems,
  updateItem,
  removeItem
};

