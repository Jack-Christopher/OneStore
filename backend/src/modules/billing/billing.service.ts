export { }; // Empty export to force module scope

import { BillingDocumentType } from './billing.types';
import { parseKeyfacilFile } from './keyfacil-parser';
import { toSnakeCase } from '../../shared/utils/object';

const repo = require("./billing.repository");
const User = require("../../database/models/User");

/**
 * Obtiene el tenant_id del usuario
 */
async function getTenantId(userId: string): Promise<string> {
  const user = await User.findById(userId).lean();
  if (!user || !user.tenant_id || user.tenant_id === 'orphan') {
    throw new Error('Usuario no tiene un tenant válido');
  }
  return user.tenant_id;
}

/**
 * Lista todos los documentos de un tipo específico
 */
async function getAll(documentType: BillingDocumentType, userId: string) {
  return repo.findAll(documentType, userId);
}

/**
 * Obtiene un documento por ID
 */
async function getOne(documentType: BillingDocumentType, id: string) {
  return repo.findById(documentType, id);
}

/**
 * Crea un nuevo documento
 */
async function create(documentType: BillingDocumentType, dto: any, userId: string) {
  const tenantId = await getTenantId(userId);
  const formattedData = toSnakeCase(dto);
  formattedData.tenant_id = tenantId;
  formattedData.created_by = userId;
  formattedData.updated_by = userId;
  
  return repo.create(documentType, formattedData);
}

/**
 * Actualiza un documento
 */
async function update(documentType: BillingDocumentType, id: string, dto: any, userId: string) {
  const formattedData = toSnakeCase(dto);
  formattedData.updated_by = userId;
  
  return repo.update(documentType, id, formattedData);
}

/**
 * Elimina un documento
 */
async function remove(documentType: BillingDocumentType, id: string) {
  return repo.delete(documentType, id);
}

/**
 * Obtiene los items de un documento
 */
async function getDocumentItems(documentType: BillingDocumentType, documentId: string, userId: string) {
  return repo.findItemsByDocument(documentType, documentId, userId);
}

/**
 * Crea un item de documento
 */
async function createDocumentItem(dto: any, userId: string) {
  const tenantId = await getTenantId(userId);
  const formattedData = toSnakeCase(dto);
  formattedData.tenant_id = tenantId;
  formattedData.created_by = userId;
  formattedData.updated_by = userId;
  
  return repo.createItem(formattedData);
}

/**
 * Limpia un documento antes de guardarlo
 */
function cleanDocument(doc: any): any {
  const formatted = toSnakeCase(doc);
  
  // Limpiar campos de fecha: convertir objetos vacíos o valores inválidos a null/undefined
  const dateFields = ['fecha_emision', 'fecha_vencimiento', 'fecha_creacion'];
  dateFields.forEach(field => {
    if (formatted[field] !== null && formatted[field] !== undefined) {
      const dateValue = formatted[field];
      
      // Si es un objeto vacío, eliminarlo
      if (typeof dateValue === 'object' && !(dateValue instanceof Date)) {
        if (Object.keys(dateValue).length === 0) {
          delete formatted[field];
        } else {
          try {
            const dateStr = JSON.stringify(dateValue);
            if (dateStr === '{}' || dateStr === '[]') {
              delete formatted[field];
            }
          } catch {
            delete formatted[field];
          }
        }
      }
      // Si es string y está vacío o es un valor inválido, eliminarlo
      else if (typeof dateValue === 'string') {
        const strValue = dateValue.trim();
        if (strValue === '' || strValue === '-' || strValue === '{}' || strValue === '[]' || strValue === 'null' || strValue === 'undefined') {
          delete formatted[field];
        }
      }
      // Si es Date pero inválido, eliminarlo
      else if (dateValue instanceof Date && isNaN(dateValue.getTime())) {
        delete formatted[field];
      }
    }
  });
  
  return formatted;
}

/**
 * Importa documentos desde un archivo CSV o Excel de Keyfacil
 */
async function importFromKeyfacil(
  fileBuffer: Buffer,
  fileName: string,
  documentType: BillingDocumentType | 'auto',
  userId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const tenantId = await getTenantId(userId);
  
  // Parsear el archivo (CSV o Excel) - ahora retorna documentos agrupados por tipo
  const { documentsByType, errors: parseErrors } = parseKeyfacilFile(fileBuffer, fileName);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  const errors: string[] = [...parseErrors];
  
  // Procesar cada tipo de documento
  const documentTypes: BillingDocumentType[] = ['invoice', 'sale_ticket', 'credit_note', 'debit_note', 'sale_note', 'proforma'];
  
  for (const docType of documentTypes) {
    const documents = documentsByType[docType];
    
    if (documents.length === 0) {
      continue; // No hay documentos de este tipo
    }
    
    // Si se especificó un tipo manualmente, solo procesar ese tipo
    if (documentType !== 'auto' && documentType !== docType) {
      continue;
    }
    
    // Preparar documentos para inserción
    const documentsToInsert = documents.map((doc: any) => {
      const cleaned = cleanDocument(doc);
      cleaned.tenant_id = tenantId;
      cleaned.created_by = userId;
      cleaned.updated_by = userId;
      return cleaned;
    });
    
    // Insertar documentos de este tipo
    try {
      // Intentar insertar todos en batch primero
      await repo.createMany(docType, documentsToInsert);
      totalSuccess += documentsToInsert.length;
    } catch (error: any) {
      // Si falla el batch, intentar uno por uno
      if (error.code === 11000 || error.name === 'MongoServerError') {
        // Error de duplicado u otro error de MongoDB, intentar uno por uno
        for (let i = 0; i < documentsToInsert.length; i++) {
          try {
            await repo.create(docType, documentsToInsert[i]);
            totalSuccess++;
          } catch (itemError: any) {
            totalFailed++;
            if (itemError.code === 11000) {
              errors.push(`${docType} registro ${i + 1}: Documento duplicado (serie: ${documentsToInsert[i].serie}, número: ${documentsToInsert[i].numero})`);
            } else {
              errors.push(`${docType} registro ${i + 1}: ${itemError.message || 'Error desconocido'}`);
            }
          }
        }
      } else {
        // Otro tipo de error - intentar uno por uno para ver cuáles fallan
        for (let i = 0; i < documentsToInsert.length; i++) {
          try {
            await repo.create(docType, documentsToInsert[i]);
            totalSuccess++;
          } catch (itemError: any) {
            totalFailed++;
            errors.push(`${docType} registro ${i + 1}: ${itemError.message || 'Error desconocido'}`);
          }
        }
      }
    }
  }
  
  return { success: totalSuccess, failed: totalFailed, errors };
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

