export { }; // Empty export to force module scope

import { BillingDocumentType } from './billing.types';
import { parseKeyfacilFile } from './keyfacil-parser';
import { toSnakeCase } from '../../shared/utils/object';

const repo = require("./billing.repository");
const User = require("../../database/models/User");
const Customer = require("../../database/models/Customer");
const Product = require("../../database/models/Product");
const Warehouse = require("../../database/models/Warehouse");
const Category = require("../../database/models/Category");
const UnitOfMeasure = require("../../database/models/UnitOfMeasure");
const salesService = require("../sales/sales.service");
const productsRepo = require("../products/products.repository");

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
 * Busca o crea un cliente por documento
 */
async function findOrCreateCustomer(tenantId: string, document: string, name: string, userId: string): Promise<{ id: string; created: boolean }> {
  if (!document || !name) {
    throw new Error('Documento y nombre del cliente son requeridos');
  }

  // Buscar cliente existente por documento
  const existingCustomer = await Customer.findOne({
    tenant_id: tenantId,
    document: document.trim()
  }).lean();

  if (existingCustomer) {
    return { id: existingCustomer._id.toString(), created: false };
  }

  // Crear nuevo cliente
  const newCustomer = await Customer.create({
    tenant_id: tenantId,
    document: document.trim(),
    name: name.trim(),
    is_active: true,
    created_by: userId,
    updated_by: userId
  });

  return { id: newCustomer._id.toString(), created: true };
}

/**
 * Busca un producto por SKU (no crea si no existe)
 */
async function findProduct(tenantId: string, sku: string): Promise<string | null> {
  if (!sku) {
    return null;
  }

  // Buscar producto existente por SKU
  const existingProduct = await Product.findOne({
    tenant_id: tenantId,
    sku: sku.trim()
  }).lean();

  if (existingProduct) {
    return existingProduct._id.toString();
  }

  return null;
}

/**
 * Obtiene almacén por defecto (crea si no existe)
 */
async function getDefaultWarehouse(tenantId: string, userId: string): Promise<string> {
  let warehouse = await Warehouse.findOne({ tenant_id: tenantId }).lean();
  if (!warehouse) {
    warehouse = await Warehouse.create({
      tenant_id: tenantId,
      name: 'Almacén Principal',
      is_active: true,
      created_by: userId,
      updated_by: userId
    });
  }
  return warehouse._id.toString();
}

/**
 * Importa documentos desde un archivo CSV o Excel de Keyfacil
 * Ahora también crea Sales desde Invoice y SaleTicket
 */
async function importFromKeyfacil(
  fileBuffer: Buffer,
  fileName: string,
  documentType: BillingDocumentType | 'auto',
  userId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log('\n=== INICIANDO IMPORTACIÓN DESDE KEYFACIL ===');
  console.log(`Archivo: ${fileName}`);
  console.log(`Tipo de documento: ${documentType}`);

  const tenantId = await getTenantId(userId);
  console.log(`Tenant ID: ${tenantId}`);

  // Parsear el archivo (CSV o Excel) - ahora retorna documentos agrupados por tipo con items
  const { documentsByType, errors: parseErrors } = parseKeyfacilFile(fileBuffer, fileName);

  console.log(`\n--- RESULTADOS DEL PARSEO ---`);
  console.log(`Errores de parseo: ${parseErrors.length}`);
  if (parseErrors.length > 0) {
    console.log(`\n⚠️  PRIMEROS ERRORES DE PARSEO (mostrando hasta 10):`);
    parseErrors.slice(0, 10).forEach((error, idx) => {
      console.log(`   ${idx + 1}. ${error}`);
    });
    if (parseErrors.length > 10) {
      console.log(`   ... y ${parseErrors.length - 10} errores más`);
    }
  }

  // Estadísticas de importación
  const stats = {
    billingDocuments: { created: 0, failed: 0, byType: {} as Record<string, number> },
    customers: { created: 0, found: 0 },
    sales: { created: 0, failed: 0 },
    saleItems: { created: 0, skipped: 0 },
    products: { found: 0, notFound: 0 }
  };

  let totalSuccess = 0;
  let totalFailed = 0;
  const errors: string[] = [...parseErrors];

  // Obtener almacén por defecto
  const defaultWarehouseId = await getDefaultWarehouse(tenantId, userId);
  console.log(`Almacén por defecto: ${defaultWarehouseId}`);

  // Procesar cada tipo de documento
  const documentTypes: BillingDocumentType[] = ['invoice', 'sale_ticket', 'credit_note', 'debit_note', 'sale_note', 'proforma'];

  for (const docType of documentTypes) {
    const documents = documentsByType[docType];

    if (documents.length === 0) {
      continue; // No hay documentos de este tipo
    }

    console.log(`\n--- PROCESANDO ${docType.toUpperCase()} ---`);
    console.log(`Documentos encontrados: ${documents.length}`);

    // Si se especificó un tipo manualmente, solo procesar ese tipo
    if (documentType !== 'auto' && documentType !== docType) {
      continue;
    }

    // Preparar documentos para inserción (siempre crear documentos de facturación)
    const documentsToInsert = documents.map((doc: any) => {
      const cleaned = cleanDocument(doc);
      cleaned.tenant_id = tenantId;
      cleaned.created_by = userId;
      cleaned.updated_by = userId;
      return cleaned;
    });

    // Insertar documentos de facturación de este tipo
    let docSuccess = 0;
    let docFailed = 0;
    try {
      // Intentar insertar todos en batch primero
      await repo.createMany(docType, documentsToInsert);
      docSuccess = documentsToInsert.length;
      stats.billingDocuments.created += docSuccess;
      stats.billingDocuments.byType[docType] = (stats.billingDocuments.byType[docType] || 0) + docSuccess;
      console.log(`✓ ${docType}: ${docSuccess} documentos creados en batch`);
      totalSuccess += docSuccess;
    } catch (error: any) {
      // Si falla el batch, intentar uno por uno
      if (error.code === 11000 || error.name === 'MongoServerError') {
        // Error de duplicado u otro error de MongoDB, intentar uno por uno
        for (let i = 0; i < documentsToInsert.length; i++) {
          try {
            await repo.create(docType, documentsToInsert[i]);
            docSuccess++;
            totalSuccess++;
          } catch (itemError: any) {
            docFailed++;
            totalFailed++;
            if (itemError.code === 11000) {
              errors.push(`${docType} registro ${i + 1}: Documento duplicado (serie: ${documentsToInsert[i].serie}, número: ${documentsToInsert[i].numero})`);
            } else {
              errors.push(`${docType} registro ${i + 1}: ${itemError.message || 'Error desconocido'}`);
            }
          }
        }
        stats.billingDocuments.created += docSuccess;
        stats.billingDocuments.failed += docFailed;
        stats.billingDocuments.byType[docType] = (stats.billingDocuments.byType[docType] || 0) + docSuccess;
        console.log(`✓ ${docType}: ${docSuccess} documentos creados, ${docFailed} fallaron`);
      } else {
        // Otro tipo de error - intentar uno por uno para ver cuáles fallan
        for (let i = 0; i < documentsToInsert.length; i++) {
          try {
            await repo.create(docType, documentsToInsert[i]);
            docSuccess++;
            totalSuccess++;
          } catch (itemError: any) {
            docFailed++;
            totalFailed++;
            errors.push(`${docType} registro ${i + 1}: ${itemError.message || 'Error desconocido'}`);
          }
        }
        stats.billingDocuments.created += docSuccess;
        stats.billingDocuments.failed += docFailed;
        stats.billingDocuments.byType[docType] = (stats.billingDocuments.byType[docType] || 0) + docSuccess;
        console.log(`✓ ${docType}: ${docSuccess} documentos creados, ${docFailed} fallaron`);
      }
    }

    // Para Invoice y SaleTicket, también crear Sales con items
    if (docType === 'invoice' || docType === 'sale_ticket') {
      console.log(`\n--- CREANDO SALES PARA ${docType.toUpperCase()} ---`);
      let salesCreated = 0;
      let salesFailed = 0;

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        // Solo procesar si tiene items
        if (!doc.items || doc.items.length === 0) {
          continue;
        }

        try {
          // Detectar si es cliente anónimo o público en general
          const isAnonymousCustomer =
            !doc.cliente_doc ||
            !doc.cliente_nombre ||
            doc.cliente_nombre.trim().toUpperCase() === 'PÚBLICO EN GENERAL' ||
            doc.cliente_nombre.trim().toUpperCase() === 'PUBLICO EN GENERAL';

          let customerId: string | null = null;
          let customerName = 'PÚBLICO EN GENERAL';
          let customerDocument: string | null = null;

          if (isAnonymousCustomer) {
            // No crear cliente, pero usar datos anónimos para la venta
            // console.log(`  ℹ️  Cliente anónimo detectado: ${doc.cliente_nombre || 'Sin nombre'} - No se creará cliente, se asignará como anónimo`);
            continue;
          } else {
            // Buscar o crear cliente normal
            const customerResult = await findOrCreateCustomer(
              tenantId,
              doc.cliente_doc,
              doc.cliente_nombre,
              userId
            );

            if (customerResult.created) {
              stats.customers.created++;
              console.log(`  ✓ Cliente creado: ${doc.cliente_nombre} (${doc.cliente_doc})`);
            } else {
              stats.customers.found++;
            }

            customerId = customerResult.id;
            customerName = doc.cliente_nombre;
            customerDocument = doc.cliente_doc;
          }

          // Determinar moneda (usar la del primer item o del documento)
          const firstItem = doc.items[0];
          const currency = firstItem?.moneda || doc.moneda || 'PEN';
          const useForeignCurrency = currency && currency.toUpperCase() !== 'PEN';

          // Preparar items de la venta
          const saleItems: any[] = [];
          let hasValidItems = false;

          for (const item of doc.items) {
            // Validar campos requeridos del item - usar 'codigo' según el parser
            if (!item.codigo) {
              const errorMsg = `${docType} ${doc.serie}-${doc.numero}: Item sin código de producto - El item no tiene el campo 'codigo' (SKU) requerido`;
              errors.push(errorMsg);
              stats.saleItems.skipped++;
              continue;
            }

            if (!item.cantidad || item.cantidad <= 0) {
              const errorMsg = `${docType} ${doc.serie}-${doc.numero}: Item con cantidad inválida (SKU: ${item.codigo}) - La cantidad debe ser mayor a 0, valor encontrado: ${item.cantidad}`;
              errors.push(errorMsg);
              stats.saleItems.skipped++;
              continue;
            }

            if (!item.precio_unitario || item.precio_unitario <= 0) {
              const errorMsg = `${docType} ${doc.serie}-${doc.numero}: Item con precio unitario inválido (SKU: ${item.codigo}) - El precio unitario debe ser mayor a 0, valor encontrado: ${item.precio_unitario}`;
              errors.push(errorMsg);
              stats.saleItems.skipped++;
              continue;
            }

            // Buscar producto (no crear si no existe) - usar 'codigo'
            const productId = await findProduct(tenantId, item.codigo);
            if (!productId) {
              stats.products.notFound++;
              stats.saleItems.skipped++;
              const errorMsg = `${docType} ${doc.serie}-${doc.numero}: Producto no encontrado (SKU: ${item.codigo}) - omitiendo item - El producto con este SKU no existe en la base de datos. Debe importarse primero desde Compras o crearse manualmente`;
              errors.push(errorMsg);
              if (stats.products.notFound <= 10) { // Mostrar solo los primeros 10 productos no encontrados
                console.log(`    ⚠️  Producto no encontrado: ${item.codigo}`);
              }
              continue;
            }

            stats.products.found++;

            // Obtener unidad de medida del producto
            const product = await Product.findById(productId).lean();
            if (!product || !product.unit_id) {
              const errorMsg = `${docType} ${doc.serie}-${doc.numero}: Producto sin unidad de medida (SKU: ${item.codigo}) - El producto existe pero no tiene unidad de medida asignada. Debe corregirse en la configuración del producto`;
              errors.push(errorMsg);
              stats.saleItems.skipped++;
              console.log(`    ✗ Producto sin unidad: ${item.codigo}`);
              continue;
            }

            // Calcular subtotal
            const subtotal = item.total_linea || (item.cantidad * item.precio_unitario);

            saleItems.push({
              tenantId: tenantId,
              productId: productId,
              unitId: product.unit_id.toString(),
              quantity: item.cantidad,
              unitPrice: item.precio_unitario,
              subtotal: subtotal
            });

            hasValidItems = true;
          }

          // Ya se contaron los skipped arriba, solo contar los creados
          stats.saleItems.created += saleItems.length;

          if (!hasValidItems || saleItems.length === 0) {
            const errorMsg = `${docType} ${doc.serie}-${doc.numero}: No se pudo crear la venta - ningún item válido - De ${doc.items.length} items, ${saleItems.length} fueron válidos. Revisar errores anteriores para ver por qué se omitieron los items`;
            errors.push(errorMsg);
            salesFailed++;
            console.log(`  ✗ ${errorMsg}`);
            continue;
          }

          // Calcular total de la venta
          const totalAmount = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

          // Crear Sale usando salesService.createWithItems
          // Para clientes anónimos, customerId será null pero customerName y customerDocument se establecerán
          const saleData: any = {
            tenantId: tenantId,
            userId: userId,
            warehouseId: defaultWarehouseId,
            customerName: customerName, // Siempre establecer, incluso para anónimos
            totalAmount: totalAmount,
            useForeignCurrency: useForeignCurrency,
            currencyCode: useForeignCurrency ? currency.toUpperCase() : undefined,
            exchangeRate: useForeignCurrency ? 1 : undefined, // TODO: Obtener tasa de cambio real
            totalOriginal: useForeignCurrency ? totalAmount : undefined
          };

          // Agregar datos del cliente (pueden ser null para anónimos)
          if (customerId) {
            saleData.customerId = customerId;
          }
          if (customerDocument) {
            saleData.customerDocument = customerDocument;
          }

          const sale = await salesService.createWithItems({
            sale: saleData,
            items: saleItems
          }, userId);

          salesCreated++;
          stats.sales.created++;
          console.log(`  ✓ Sale creada: ${doc.serie}-${doc.numero} (${saleItems.length} items, Total: ${totalAmount})`);

        } catch (error: any) {
          salesFailed++;
          stats.sales.failed++;
          totalFailed++;
          const errorMsg = `${docType} ${doc.serie}-${doc.numero}: Error creando venta - ${error.message || 'Error desconocido'} - Error al crear la venta en la base de datos. Detalles: ${error.message}`;
          errors.push(errorMsg);
          console.error(`  ✗ Error en ${doc.serie}-${doc.numero}: ${error.message}`);
          if (error.stack) {
            console.error(`     Stack: ${error.stack.split('\n')[0]}`);
          }
        }
      }

      console.log(`  Resumen: ${salesCreated} ventas creadas, ${salesFailed} fallaron`);
    }
  }

  // Resumen final
  console.log('\n=== RESUMEN DE IMPORTACIÓN ===');
  console.log(`\n📄 DOCUMENTOS DE FACTURACIÓN:`);
  console.log(`  ✓ Creados: ${stats.billingDocuments.created}`);
  console.log(`  ✗ Fallaron: ${stats.billingDocuments.failed}`);
  Object.entries(stats.billingDocuments.byType).forEach(([type, count]) => {
    console.log(`    - ${type}: ${count}`);
  });

  console.log(`\n👥 CLIENTES:`);
  console.log(`  ✓ Creados: ${stats.customers.created}`);
  console.log(`  ✓ Encontrados (existentes): ${stats.customers.found}`);

  console.log(`\n💰 VENTAS (SALES):`);
  console.log(`  ✓ Creadas: ${stats.sales.created}`);
  console.log(`  ✗ Fallaron: ${stats.sales.failed}`);

  console.log(`\n📦 ITEMS DE VENTA:`);
  console.log(`  ✓ Creados: ${stats.saleItems.created}`);
  console.log(`  ⚠ Omitidos: ${stats.saleItems.skipped}`);

  console.log(`\n🛍️ PRODUCTOS:`);
  console.log(`  ✓ Encontrados: ${stats.products.found}`);
  console.log(`  ✗ No encontrados: ${stats.products.notFound}`);

  console.log(`\n📊 TOTALES:`);
  console.log(`  ✓ Exitosos: ${totalSuccess}`);
  console.log(`  ✗ Fallidos: ${totalFailed}`);
  console.log(`  ⚠ Errores: ${errors.length}`);
  console.log('\n=== FIN DE IMPORTACIÓN ===\n');

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

