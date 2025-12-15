export { }; // Empty export to force module scope

const service = require("./purchaseOrders.service");
const { ok, fail } = require("../../shared/utils/response");
const { auditCreate, auditUpdate, auditDelete } = require("../../shared/middlewares/audit");
const PurchaseOrder = require("../../database/models/PurchaseOrder");

async function getAll(req: Req, res: Res) {
  try {
    const data = await service.getAll(req?.user?.id);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAll purchaseOrders:", error);
    return fail(res, "Failed to fetch purchase orders", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const order = await service.getOne(req.params.id);
    if (!order) return fail(res, "Purchase order not found", "NOT_FOUND", 404);
    return ok(res, order);
  } catch (error) {
    console.error("Error in getOne purchaseOrder:", error);
    return fail(res, "Failed to fetch purchase order", "INTERNAL_ERROR", 500);
  }
}

async function create(req: Req, res: Res) {
  try {
    const order = await service.create(req.body);
    await auditCreate("PurchaseOrder", order, req);
    return ok(res, order);
  } catch (error) {
    console.error("Error in create purchaseOrder:", error);
    return fail(res, "Purchase order couldn't be created", "CREATE_ERROR", 409);
  }
}

async function createWithItems(req: Req, res: Res) {
  try {
    const order = await service.createWithItems(req.body, req?.user?.id);
    await auditCreate("PurchaseOrder", order, req);
    return ok(res, order);
  } catch (error: any) {
    console.error("Error in createWithItems purchaseOrder:", error);
    return fail(res, error.message || "Purchase order couldn't be created", "CREATE_ERROR", 409);
  }
}

async function update(req: Req, res: Res) {
  try {
    const oldRecord = await PurchaseOrder.findById(req.params.id);
    if (!oldRecord) return fail(res, "Purchase order not found", "NOT_FOUND", 404);
    const updated = await service.update(req.params.id, req.body);
    if (!updated) return fail(res, "Purchase order not found", "NOT_FOUND", 404);
    await auditUpdate("PurchaseOrder", oldRecord, updated, req);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in update purchaseOrder:", error);
    return fail(res, "Failed to update purchase order", "UPDATE_ERROR", 500);
  }
}

async function remove(req: Req, res: Res) {
  try {
    const oldRecord = await PurchaseOrder.findById(req.params.id);
    if (!oldRecord) return fail(res, "Purchase order not found", "NOT_FOUND", 404);
    const result = await service.remove(req.params.id);
    await auditDelete("PurchaseOrder", oldRecord, req);
    return ok(res, result);
  } catch (error) {
    console.error("Error in remove purchaseOrder:", error);
    return fail(res, "Failed to delete purchase order", "DELETE_ERROR", 500);
  }
}

async function receiveOrder(req: Req, res: Res) {
  try {
    const result = await service.receiveOrder(req.params.id, req?.user?.id);
    if (!result) return fail(res, "Purchase order not found", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error) {
    console.error("Error in receiveOrder:", error);
    return fail(res, "Purchase order couldn't be received", "RECEIVE_ERROR", 409);
  }
}

// Items
async function getItemsByOrderId(req: Req, res: Res) {
  try {
    const items = await service.getItemsByOrderId(req.params.id);
    return ok(res, items);
  } catch (error) {
    console.error("Error in getItemsByOrderId:", error);
    return fail(res, "Failed to fetch purchase order items", "INTERNAL_ERROR", 500);
  }
}

async function createItem(req: Req, res: Res) {
  try {
    const item = await service.createItem(req.body);
    return ok(res, item);
  } catch (error) {
    console.error("Error in createItem:", error);
    return fail(res, "Purchase order item couldn't be created", "CREATE_ERROR", 409);
  }
}

async function createManyItems(req: Req, res: Res) {
  try {
    const items = await service.createManyItems(req.body);
    return ok(res, items);
  } catch (error) {
    console.error("Error in createManyItems:", error);
    return fail(res, "Purchase order items couldn't be created", "CREATE_ERROR", 409);
  }
}

async function updateItem(req: Req, res: Res) {
  try {
    const updated = await service.updateItem(req.params.itemId, req.body);
    if (!updated) return fail(res, "Purchase order item not found", "NOT_FOUND", 404);
    return ok(res, updated);
  } catch (error) {
    console.error("Error in updateItem:", error);
    return fail(res, "Failed to update purchase order item", "UPDATE_ERROR", 500);
  }
}

async function removeItem(req: Req, res: Res) {
  try {
    const result = await service.removeItem(req.params.itemId);
    if (!result) return fail(res, "Purchase order item not found", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error) {
    console.error("Error in removeItem:", error);
    return fail(res, "Failed to delete purchase order item", "DELETE_ERROR", 500);
  }
}

/**
 * Importa compras desde Keyfacil
 */
async function importFromKeyfacil(req: Req, res: Res) {
  try {
    if (!req.file) {
      return fail(res, "No se proporcionó ningún archivo", "NO_FILE", 400);
    }
    
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname || 'file';
    
    const result = await service.importFromKeyfacil(
      fileBuffer,
      fileName,
      req?.user?.id
    );
    
    return ok(res, result);
  } catch (error: any) {
    console.error("Error in importFromKeyfacil:", error);
    return fail(res, error.message || "Error al importar compras", "IMPORT_ERROR", 500);
  }
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
  removeItem,
  importFromKeyfacil
};

