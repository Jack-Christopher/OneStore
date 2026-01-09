import { PurchaseOrderUpdateDTO, PurchaseOrderItemDTO, CreatePurchaseOrderWithItemsDTO } from "./purchaseOrders.types";
import { toSnakeCase } from "../../shared/utils/object";
import { parseKeyfacilPurchasesFile, ParsedPurchase } from "./keyfacil-purchases-parser";

const repo = require("./purchaseOrders.repository");
const stockMovementsService = require("../stockMovements/stockMovements.service");
const warehouseProductsService = require("../warehouseProducts/warehouseProducts.service");
const settingsService = require("../settings/settings.service");
const Supplier = require("../../database/models/Supplier");
const Product = require("../../database/models/Product");
const Warehouse = require("../../database/models/Warehouse");
const Category = require("../../database/models/Category");
const UnitOfMeasure = require("../../database/models/UnitOfMeasure");
const suppliersRepo = require("../suppliers/suppliers.repository");
const productsRepo = require("../products/products.repository");
const warehousesRepo = require("../warehouses/warehouses.repository");
const User = require("../../database/models/User");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function create(dto: PurchaseOrderUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

async function createWithItems(dto: CreatePurchaseOrderWithItemsDTO, userId: string) {
  // Get base currency
  const baseCurrency = await settingsService.getBaseCurrency(userId);
  if (!baseCurrency) {
    throw new Error("Base currency must be set before creating transactions");
  }

  // Validate and process currency fields
  const orderData: any = toSnakeCase(dto.order);

  // Check if using foreign currency
  const useForeignCurrency = dto.order.useForeignCurrency || false;

  if (useForeignCurrency) {
    // Validate required fields
    if (!dto.order.currencyCode) {
      throw new Error("currency_code is required when using foreign currency");
    }
    if (!dto.order.exchangeRate || dto.order.exchangeRate <= 0) {
      throw new Error("exchange_rate must be greater than 0");
    }
    if (dto.order.totalOriginal === undefined || dto.order.totalOriginal === null) {
      throw new Error("total_original is required when using foreign currency");
    }

    orderData.currency_code = dto.order.currencyCode.toUpperCase();
    orderData.exchange_rate = dto.order.exchangeRate;
    // total_original is the sum of all item subtotals in alternative currency
    // total_base is total_original converted back to base currency (divide by exchange rate)
    orderData.total_original = dto.order.totalOriginal;
    orderData.total_base = dto.order.totalOriginal / dto.order.exchangeRate;
  } else {
    // Use base currency
    orderData.currency_code = baseCurrency;
    orderData.exchange_rate = 1;
    orderData.total_original = orderData.total_amount || 0;
    orderData.total_base = orderData.total_amount || 0;
  }

  // Keep total_amount for backward compatibility
  orderData.total_amount = orderData.total_base;

  const order = await repo.create(orderData);

  if (dto.items && dto.items.length > 0) {
    const itemsData = dto.items.map(item => {
      const itemData: any = toSnakeCase(item);
      itemData.purchase_order_id = order._id.toString();

      // Calculate currency fields for items
      // item.unitPrice and item.subtotal are in base currency
      if (useForeignCurrency) {
        // Convert from base to alternative: multiply by exchange rate
        itemData.unit_cost_original = (item.unitPrice || 0) * orderData.exchange_rate;
        itemData.unit_cost_base = item.unitPrice || 0;
      } else {
        itemData.unit_cost_original = item.unitPrice || 0;
        itemData.unit_cost_base = item.unitPrice || 0;
      }

      // Keep unit_price for backward compatibility
      itemData.unit_price = itemData.unit_cost_base;

      return itemData;
    });
    await repo.createManyItems(itemsData);
  }

  return order;
}

async function update(id: string, dto: PurchaseOrderUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.update(id, formattedData);
}

async function remove(id: string) {
  await repo.deleteItemsByOrderId(id);
  return repo.delete(id);
}

async function receiveOrder(id: string, userId: string) {
  const order = await repo.findById(id);
  if (!order) return null;
  if (order.status === 'received') return order;

  const items = await repo.findItemsByOrderId(id);

  // Create stock movements and update warehouse products for each item
  for (const item of items) {
    // Create stock movement (entry)
    await stockMovementsService.create({
      tenantId: order.tenant_id,
      warehouseId: order.warehouse_id,
      productId: item.product_id,
      movementType: 'purchase',
      quantity: item.quantity,
      relatedId: order._id.toString(),
      comment: `Recepción de orden de compra #${order.reference_number || order._id}`,
      createdBy: userId
    });

    // Update warehouse product quantity
    await warehouseProductsService.incrementQuantity(
      order.tenant_id,
      order.warehouse_id,
      item.product_id,
      item.quantity
    );

    // Update received quantity in item
    await repo.updateItem(item._id.toString(), {
      ...item.toObject(),
      received_quantity: item.quantity
    });
  }

  // Get base currency to ensure currency fields exist
  const baseCurrency = await settingsService.getBaseCurrency(userId);
  const orderObj = order.toObject ? order.toObject() : order;

  // Prepare update data - ensure all required fields are present
  const updateData: any = {
    status: 'received',
    updated_by: userId
  };

  // Ensure currency fields exist - if they don't, set defaults
  // This prevents MongoDB validation errors when updating
  if (!orderObj.currency_code) {
    updateData.currency_code = baseCurrency || 'PEN';
  }
  if (orderObj.exchange_rate === undefined || orderObj.exchange_rate === null) {
    updateData.exchange_rate = 1;
  }
  if (orderObj.total_original === undefined || orderObj.total_original === null) {
    updateData.total_original = orderObj.total_amount || 0;
  }
  if (orderObj.total_base === undefined || orderObj.total_base === null) {
    updateData.total_base = orderObj.total_amount || 0;
  }

  // Update order status with all required fields
  return repo.update(id, updateData);
}

// Items functions
async function getItemsByOrderId(orderId: string) {
  return repo.findItemsByOrderId(orderId);
}

async function createItem(dto: PurchaseOrderItemDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.createItem(formattedData);
}

async function createManyItems(dtoArray: PurchaseOrderItemDTO[]) {
  const formattedDataArray = dtoArray.map(dto => toSnakeCase(dto));
  return repo.createManyItems(formattedDataArray);
}

async function updateItem(id: string, dto: PurchaseOrderItemDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.updateItem(id, formattedData);
}

async function removeItem(id: string) {
  return repo.deleteItem(id);
}

/**
 * Busca o crea un proveedor por documento
 */
async function findOrCreateSupplier(tenantId: string, document: string, name: string, userId: string): Promise<string> {
  if (!document || !name) {
    throw new Error('Documento y nombre del proveedor son requeridos');
  }

  // Buscar proveedor existente por documento
  const existingSupplier = await Supplier.findOne({
    tenant_id: tenantId,
    document: document.trim()
  }).lean();

  if (existingSupplier) {
    return existingSupplier._id.toString();
  }

  // Crear nuevo proveedor
  const newSupplier = await Supplier.create({
    tenant_id: tenantId,
    document: document.trim(),
    name: name.trim(),
    created_by: userId,
    updated_by: userId
  });

  return newSupplier._id.toString();
}

/**
 * Busca o crea un producto por SKU
 */
async function findOrCreateProduct(tenantId: string, sku: string, name: string, userId: string): Promise<string> {
  if (!sku || !name) {
    throw new Error('SKU y nombre del producto son requeridos');
  }

  // Buscar producto existente por SKU
  const existingProduct = await Product.findOne({
    tenant_id: tenantId,
    sku: sku.trim()
  }).lean();

  if (existingProduct) {
    return existingProduct._id.toString();
  }

  // Obtener o crear categoría por defecto
  let defaultCategory = await Category.findOne({ tenant_id: tenantId }).lean();
  if (!defaultCategory) {
    // Crear categoría por defecto si no existe
    defaultCategory = await Category.create({
      tenant_id: tenantId,
      name: 'Categoría General',
      description: 'Categoría creada automáticamente para importación',
      created_by: userId,
      updated_by: userId
    });
  }

  // Obtener o crear unidad de medida por defecto
  let defaultUnit = await UnitOfMeasure.findOne({
    $or: [
      { tenant_id: tenantId },
      { tenant_id: 'default' }
    ]
  }).lean();

  if (!defaultUnit) {
    // Crear unidad de medida por defecto si no existe
    defaultUnit = await UnitOfMeasure.create({
      tenant_id: tenantId,
      code: 'UN',
      name: 'Unidades',
      description: 'Unidad de medida creada automáticamente para importación',
      created_by: userId,
      updated_by: userId
    });
  }

  // Crear nuevo producto
  const newProduct = await Product.create({
    tenant_id: tenantId,
    category_id: defaultCategory._id,
    unit_id: defaultUnit._id,
    sku: sku.trim(),
    name: name.trim(),
    sale_price: 0, // Precio de venta por defecto, se puede actualizar después
    is_active: true,
    created_by: userId,
    updated_by: userId
  });

  return newProduct._id.toString();
}

/**
 * Obtiene el primer almacén disponible del tenant, o crea uno por defecto si no existe
 */
async function getDefaultWarehouse(tenantId: string, userId: string): Promise<string> {
  const warehouse = await Warehouse.findOne({ tenant_id: tenantId }).lean();

  if (warehouse) {
    return warehouse._id.toString();
  }

  // Crear almacén por defecto si no existe
  const newWarehouse = await Warehouse.create({
    tenant_id: tenantId,
    name: 'Almacén Principal',
    is_active: true,
    created_by: userId,
    updated_by: userId
  });

  return newWarehouse._id.toString();
}

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
 * Importa compras desde un archivo CSV o Excel de Keyfacil
 */
async function importFromKeyfacil(
  fileBuffer: Buffer,
  fileName: string,
  userId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const tenantId = await getTenantId(userId);

  // Obtener moneda base
  const baseCurrency = await settingsService.getBaseCurrency(userId);
  if (!baseCurrency) {
    throw new Error("Base currency must be set before importing purchases");
  }

  // Obtener almacén por defecto (crear si no existe)
  const defaultWarehouseId = await getDefaultWarehouse(tenantId, userId);

  // Parsear el archivo
  const { purchases, errors: parseErrors } = parseKeyfacilPurchasesFile(fileBuffer, fileName);

  let totalSuccess = 0;
  let totalFailed = 0;
  const errors: string[] = [...parseErrors];

  // Procesar cada compra
  for (let i = 0; i < purchases.length; i++) {
    const purchase = purchases[i];

    try {
      // Buscar o crear proveedor
      const supplierId = await findOrCreateSupplier(
        tenantId,
        purchase.proveedor_doc,
        purchase.proveedor_nombre,
        userId
      );

      // Determinar moneda y tipo de cambio
      const currencyCode = purchase.moneda || baseCurrency;
      const useForeignCurrency = currencyCode !== baseCurrency;
      let exchangeRate = 1;
      let totalOriginal = purchase.total_compra;
      let totalBase = purchase.total_compra;

      if (useForeignCurrency) {
        // Si es moneda extranjera, necesitamos el tipo de cambio
        // Por ahora, asumimos que el total_compra está en la moneda original
        // En una implementación real, podría venir en el archivo o necesitarse como parámetro
        // Por simplicidad, usamos 1:1 si no se especifica
        exchangeRate = 1; // TODO: Permitir especificar tipo de cambio
        totalOriginal = purchase.total_compra;
        totalBase = purchase.total_compra / exchangeRate;
      }

      // Calcular total de items para validación
      const itemsTotal = purchase.items.reduce((sum, item) => sum + item.total_linea, 0);

      // Handle dates: use fecha from purchase (metadata.fecha) if present, otherwise use current date
      const now = new Date();
      let createdAt: Date = now; // Default to current date

      console.log(`[PURCHASE ORDER IMPORT] Purchase ${i + 1} (${purchase.identificador || `${purchase.serie}-${purchase.numero}`}): Processing dates`);

      // Check if purchase.fecha exists and is valid (it's already parsed as Date | null by the parser)
      if (purchase.fecha !== null && purchase.fecha !== undefined) {
        // purchase.fecha is already a Date object from the parser
        if (purchase.fecha instanceof Date && !isNaN(purchase.fecha.getTime())) {
          createdAt = purchase.fecha;
          console.log(`[PURCHASE ORDER IMPORT] Purchase ${i + 1}: Found valid fecha: ${purchase.fecha.toISOString()}`);
        } else {
          console.log(`[PURCHASE ORDER IMPORT] Purchase ${i + 1}: fecha exists but is invalid:`, purchase.fecha);
        }
      } else {
        console.log(`[PURCHASE ORDER IMPORT] Purchase ${i + 1}: No fecha found, using current date: ${now.toISOString()}`);
      }

      console.log(`[PURCHASE ORDER IMPORT] Purchase ${i + 1}: Final dates - created_at: ${createdAt.toISOString()}, updated_at: ${now.toISOString()}`);

      // Crear orden de compra
      const orderData: any = {
        tenant_id: tenantId,
        supplier_id: supplierId,
        warehouse_id: defaultWarehouseId,
        user_id: userId,
        status: 'pending',
        reference_number: purchase.identificador || `${purchase.serie}-${purchase.numero}`,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        total_original: totalOriginal,
        total_base: totalBase,
        total_amount: totalBase, // Backward compatibility
        notes: purchase.observaciones || null,
        metadata: {
          comprobante: purchase.comprobante,
          serie: purchase.serie,
          numero: purchase.numero,
          fecha: purchase.fecha,
          otros: purchase.otros,
          keyfacil_import: true
        },
        created_at: createdAt, // Set the parsed date
        updated_at: now, // Always set to current date
        created_by: userId,
        updated_by: userId
      };

      // Create document instance for validation and direct insertion to respect date values
      const PurchaseOrder = require("../../database/models/PurchaseOrder");
      const doc = new PurchaseOrder(orderData);

      // Validate the document before inserting
      await doc.validate();

      // Use collection.insertOne to insert directly, respecting our date values
      // This bypasses Mongoose timestamps and uses our explicit values
      const docToInsert = doc.toObject();
      // Ensure _id is removed so MongoDB generates it
      delete docToInsert._id;

      console.log(`[PURCHASE ORDER IMPORT] Purchase ${i + 1}: Inserting order with dates - created_at: ${docToInsert.created_at?.toISOString()}, updated_at: ${docToInsert.updated_at?.toISOString()}`);

      const insertResult = await PurchaseOrder.collection.insertOne(docToInsert);
      const order = await PurchaseOrder.findById(insertResult.insertedId);

      console.log(`[PURCHASE ORDER IMPORT] Purchase ${i + 1}: Order created successfully with ID: ${order._id}`);

      // Crear items de la compra
      const itemsData: any[] = [];
      for (const item of purchase.items) {
        try {
          // Validar que el código del producto no esté vacío
          if (!item.codigo_producto || item.codigo_producto.trim() === '') {
            errors.push(`Compra ${i + 1}: Item sin código de producto`);
            continue;
          }

          // Usar código como nombre si el nombre está vacío
          const productName = item.producto && item.producto.trim() !== ''
            ? item.producto
            : item.codigo_producto;

          // Validar que los valores no sean cero
          if (!item.cantidad || item.cantidad === 0) {
            errors.push(`Compra ${i + 1}, Item ${item.codigo_producto}: Cantidad es cero o inválida (valor: ${item.cantidad})`);
            console.error(`Item cantidad inválida:`, { codigo: item.codigo_producto, cantidad: item.cantidad, item });
            continue;
          }

          if (!item.precio_unitario || item.precio_unitario === 0) {
            errors.push(`Compra ${i + 1}, Item ${item.codigo_producto}: Precio unitario es cero o inválido (valor: ${item.precio_unitario})`);
            console.error(`Item precio unitario inválido:`, { codigo: item.codigo_producto, precio_unitario: item.precio_unitario, item });
            continue;
          }

          if (!item.total_linea || item.total_linea === 0) {
            errors.push(`Compra ${i + 1}, Item ${item.codigo_producto}: Total línea es cero o inválido (valor: ${item.total_linea})`);
            console.error(`Item total línea inválido:`, { codigo: item.codigo_producto, total_linea: item.total_linea, item });
            continue;
          }

          // Buscar o crear producto
          const productId = await findOrCreateProduct(
            tenantId,
            item.codigo_producto,
            productName,
            userId
          );

          // Calcular precios según moneda
          let unitCostOriginal = item.precio_unitario;
          let unitCostBase = item.precio_unitario;

          if (useForeignCurrency) {
            unitCostOriginal = item.precio_unitario;
            unitCostBase = item.precio_unitario / exchangeRate;
          }

          // Usar total_linea del archivo como subtotal (convertir si es moneda extranjera)
          const subtotal = useForeignCurrency ? item.total_linea / exchangeRate : item.total_linea;

          itemsData.push({
            tenant_id: tenantId,
            purchase_order_id: order._id.toString(),
            product_id: productId,
            quantity: item.cantidad,
            unit_cost_original: unitCostOriginal,
            unit_cost_base: unitCostBase,
            unit_price: unitCostBase, // Backward compatibility
            subtotal: subtotal,
            received_quantity: 0,
            created_by: userId,
            updated_by: userId
          });
        } catch (itemError: any) {
          const errorMsg = itemError.message || 'Error desconocido';
          errors.push(`Compra ${i + 1}, Item ${item.codigo_producto || 'sin código'}: ${errorMsg}`);
          console.error(`Error creando item para producto ${item.codigo_producto}:`, itemError);
        }
      }

      if (itemsData.length > 0) {
        try {
          await repo.createManyItems(itemsData);

          // Marcar la orden como recibida automáticamente (simular click en recibido)
          // Esto crea movimientos de stock y actualiza el inventario
          try {
            await receiveOrder(order._id.toString(), userId);
          } catch (receiveError: any) {
            // Si falla la recepción, registrar error pero no fallar toda la importación
            errors.push(`Compra ${i + 1}: Se creó pero falló al marcar como recibida - ${receiveError.message || 'Error desconocido'}`);
            console.error(`Error recibiendo compra ${i + 1}:`, receiveError);
          }

          totalSuccess++;
        } catch (itemsError: any) {
          // Si falla la creación de items, eliminar la orden
          await repo.delete(order._id.toString());
          totalFailed++;
          errors.push(`Compra ${i + 1}: Error al crear items - ${itemsError.message || 'Error desconocido'}`);
          console.error(`Error creando items para compra ${i + 1}:`, itemsError);
        }
      } else {
        // Si no se pudieron crear items, eliminar la orden
        await repo.delete(order._id.toString());
        totalFailed++;
        errors.push(`Compra ${i + 1}: No se pudieron crear items (todos los items fallaron)`);
      }
    } catch (error: any) {
      totalFailed++;
      const errorMsg = error.message || 'Error desconocido';
      errors.push(`Compra ${i + 1}: ${errorMsg}`);
      console.error(`Error procesando compra ${i + 1}:`, error);
    }
  }

  return { success: totalSuccess, failed: totalFailed, errors };
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
  findOrCreateSupplier,
  findOrCreateProduct,
  getDefaultWarehouse,
  importFromKeyfacil
};

