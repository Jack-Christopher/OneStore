export { }; // Empty export to force module scope

import { BillingDocumentType } from './billing.types';

const Invoice = require("../../database/models/Invoice");
const SaleTicket = require("../../database/models/SaleTicket");
const CreditNote = require("../../database/models/CreditNote");
const DebitNote = require("../../database/models/DebitNote");
const SaleNote = require("../../database/models/SaleNote");
const Proforma = require("../../database/models/Proforma");
const BillingDocumentItem = require("../../database/models/BillingDocumentItem");
const User = require("../../database/models/User");

// Mapeo de tipos de documento a modelos
const modelMap: Record<BillingDocumentType, any> = {
  invoice: Invoice,
  sale_ticket: SaleTicket,
  credit_note: CreditNote,
  debit_note: DebitNote,
  sale_note: SaleNote,
  proforma: Proforma,
};

/**
 * Obtiene el tenant_id del usuario
 */
async function getTenantId(userId: string): Promise<string | null> {
  const user = await User.findById(userId).lean();
  return user?.tenant_id || null;
}

/**
 * Obtiene el modelo correspondiente al tipo de documento
 */
function getModel(documentType: BillingDocumentType) {
  const model = modelMap[documentType];
  if (!model) {
    throw new Error(`Tipo de documento inválido: ${documentType}`);
  }
  return model;
}

module.exports = {
  /**
   * Lista todos los documentos de un tipo específico para un usuario
   */
  async findAll(documentType: BillingDocumentType, userId: string) {
    const tenantId = await getTenantId(userId);
    if (!tenantId || tenantId === 'orphan') {
      return [];
    }
    
    const Model = getModel(documentType);
    return Model.find({ tenant_id: tenantId }).lean();
  },

  /**
   * Encuentra un documento por ID
   */
  async findById(documentType: BillingDocumentType, id: string) {
    const Model = getModel(documentType);
    return Model.findById(id).lean();
  },

  /**
   * Crea un nuevo documento
   */
  async create(documentType: BillingDocumentType, data: any) {
    const Model = getModel(documentType);
    return Model.create(data);
  },

  /**
   * Crea múltiples documentos en batch
   */
  async createMany(documentType: BillingDocumentType, dataArray: any[]) {
    const Model = getModel(documentType);
    return Model.insertMany(dataArray);
  },

  /**
   * Actualiza un documento
   */
  async update(documentType: BillingDocumentType, id: string, data: any) {
    const Model = getModel(documentType);
    return Model.findByIdAndUpdate(id, data, { new: true }).lean();
  },

  /**
   * Elimina un documento
   */
  async delete(documentType: BillingDocumentType, id: string) {
    const Model = getModel(documentType);
    return Model.findByIdAndDelete(id);
  },

  // Items methods
  /**
   * Obtiene todos los items de un documento
   */
  async findItemsByDocument(documentType: BillingDocumentType, documentId: string, userId: string) {
    const tenantId = await getTenantId(userId);
    if (!tenantId || tenantId === 'orphan') {
      return [];
    }
    
    return BillingDocumentItem.find({
      tenant_id: tenantId,
      document_type: documentType,
      document_id: documentId
    }).lean();
  },

  /**
   * Crea un item de documento
   */
  async createItem(data: any) {
    return BillingDocumentItem.create(data);
  },

  /**
   * Crea múltiples items en batch
   */
  async createManyItems(dataArray: any[]) {
    return BillingDocumentItem.insertMany(dataArray);
  },
};

