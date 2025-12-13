export { }; // Empty export to force module scope

const service = require("./billing.service");
const { ok, fail } = require("../../shared/utils/response");

/**
 * Valida que el tipo de documento sea válido
 */
function validateDocumentType(type: string): string | null {
  const validTypes = ['invoice', 'sale_ticket', 'credit_note', 'debit_note', 'sale_note', 'proforma'];
  return validTypes.includes(type) ? type : null;
}

/**
 * Lista todos los documentos de un tipo específico
 */
async function getAll(req: Req, res: Res) {
  try {
    const documentType = validateDocumentType(req.params.documentType);
    if (!documentType) {
      return fail(res, "Tipo de documento inválido", "INVALID_DOCUMENT_TYPE", 400);
    }
    
    const data = await service.getAll(documentType as any, req?.user?.id);
    return ok(res, data);
  } catch (error: any) {
    console.error("Error in getAll billing documents:", error);
    return fail(res, error.message || "Failed to fetch documents", "INTERNAL_ERROR", 500);
  }
}

/**
 * Obtiene un documento por ID
 */
async function getOne(req: Req, res: Res) {
  try {
    const documentType = validateDocumentType(req.params.documentType);
    if (!documentType) {
      return fail(res, "Tipo de documento inválido", "INVALID_DOCUMENT_TYPE", 400);
    }
    
    const document = await service.getOne(documentType, req.params.id);
    if (!document) return fail(res, "Documento no encontrado", "NOT_FOUND", 404);
    return ok(res, document);
  } catch (error: any) {
    console.error("Error in getOne billing document:", error);
    return fail(res, error.message || "Failed to fetch document", "INTERNAL_ERROR", 500);
  }
}

/**
 * Crea un nuevo documento
 */
async function create(req: Req, res: Res) {
  try {
    const documentType = validateDocumentType(req.params.documentType);
    if (!documentType) {
      return fail(res, "Tipo de documento inválido", "INVALID_DOCUMENT_TYPE", 400);
    }
    
    const document = await service.create(documentType, req.body, req?.user?.id);
    return ok(res, document);
  } catch (error: any) {
    console.error("Error in create billing document:", error);
    return fail(res, error.message || "No se pudo crear el documento", "CREATE_ERROR", 409);
  }
}

/**
 * Actualiza un documento
 */
async function update(req: Req, res: Res) {
  try {
    const documentType = validateDocumentType(req.params.documentType);
    if (!documentType) {
      return fail(res, "Tipo de documento inválido", "INVALID_DOCUMENT_TYPE", 400);
    }
    
    const updated = await service.update(documentType, req.params.id, req.body, req?.user?.id);
    if (!updated) return fail(res, "Documento no encontrado", "NOT_FOUND", 404);
    return ok(res, updated);
  } catch (error: any) {
    console.error("Error in update billing document:", error);
    return fail(res, error.message || "Failed to update document", "UPDATE_ERROR", 500);
  }
}

/**
 * Elimina un documento
 */
async function remove(req: Req, res: Res) {
  try {
    const documentType = validateDocumentType(req.params.documentType);
    if (!documentType) {
      return fail(res, "Tipo de documento inválido", "INVALID_DOCUMENT_TYPE", 400);
    }
    
    const result = await service.remove(documentType, req.params.id);
    if (!result) return fail(res, "Documento no encontrado", "NOT_FOUND", 404);
    return ok(res, result);
  } catch (error: any) {
    console.error("Error in remove billing document:", error);
    return fail(res, error.message || "Failed to delete document", "DELETE_ERROR", 500);
  }
}

/**
 * Obtiene los items de un documento
 */
async function getDocumentItems(req: Req, res: Res) {
  try {
    const documentType = validateDocumentType(req.params.documentType);
    if (!documentType) {
      return fail(res, "Tipo de documento inválido", "INVALID_DOCUMENT_TYPE", 400);
    }
    
    const items = await service.getDocumentItems(documentType, req.params.documentId, req?.user?.id);
    return ok(res, items);
  } catch (error: any) {
    console.error("Error in getDocumentItems:", error);
    return fail(res, error.message || "Failed to fetch document items", "INTERNAL_ERROR", 500);
  }
}

/**
 * Crea un item de documento
 */
async function createDocumentItem(req: Req, res: Res) {
  try {
    const documentType = validateDocumentType(req.params.documentType);
    if (!documentType) {
      return fail(res, "Tipo de documento inválido", "INVALID_DOCUMENT_TYPE", 400);
    }
    
    const itemData = {
      ...req.body,
      documentType,
      documentId: req.params.documentId,
    };
    
    const item = await service.createDocumentItem(itemData, req?.user?.id);
    return ok(res, item);
  } catch (error: any) {
    console.error("Error in createDocumentItem:", error);
    return fail(res, error.message || "No se pudo crear el item", "CREATE_ERROR", 409);
  }
}

/**
 * Importa documentos desde Keyfacil
 */
async function importFromKeyfacil(req: Req, res: Res) {
  try {
    if (!req.file) {
      return fail(res, "No se proporcionó ningún archivo", "NO_FILE", 400);
    }
    
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname || 'file';
    const documentType = req.body.documentType || 'auto'; // 'auto' para detección automática
    
    const result = await service.importFromKeyfacil(
      fileBuffer,
      fileName,
      documentType,
      req?.user?.id
    );
    
    return ok(res, result);
  } catch (error: any) {
    console.error("Error in importFromKeyfacil:", error);
    return fail(res, error.message || "Error al importar documentos", "IMPORT_ERROR", 500);
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  getDocumentItems,
  createDocumentItem,
  importFromKeyfacil,
};

