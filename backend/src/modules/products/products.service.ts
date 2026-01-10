import { ProductUpdateDTO } from "./products.types";
import { toSnakeCase } from "../../shared/utils/object";
import { Double } from 'mongodb';
import { parseKeyfacilProductsFile } from "./keyfacil-products-parser";

const repo = require("./products.repository");
const Product = require("../../database/models/Product");
const Category = require("../../database/models/Category");
const UnitOfMeasure = require("../../database/models/UnitOfMeasure");
const Supplier = require("../../database/models/Supplier");
const User = require("../../database/models/User");

async function getAll(user_id: string) {
  return repo.findAll(user_id);
}

async function getMostSold(user_id: string) {
  return repo.findMostSold(user_id);
}

async function getOne(id: string) {
  return repo.findById(id);
}

async function getByBarcode(barcode: string, userId: string) {
  const tenantId = await getTenantId(userId);
  const product = await Product.findOne({
    tenant_id: tenantId,
    barcode: barcode.trim()
  })
    .populate("category_id", "name")
    .populate("unit_id", "name")
    .populate("supplier_id", "name")
    .lean();
  return product;
}

async function create(dto: ProductUpdateDTO) {
  // Clean empty strings for optional ObjectId fields - remove them (don't include in DB)
  const cleanedDto: any = { ...dto };

  // Remove empty strings, null, or undefined for optional fields
  if (cleanedDto.categoryId === "" || cleanedDto.categoryId === null || cleanedDto.categoryId === undefined) {
    delete cleanedDto.categoryId;
  }
  if (cleanedDto.unitId === "" || cleanedDto.unitId === null || cleanedDto.unitId === undefined) {
    delete cleanedDto.unitId;
  }
  if (cleanedDto.sku === "" || cleanedDto.sku === null || cleanedDto.sku === undefined) {
    delete cleanedDto.sku;
  }
  if (cleanedDto.supplierId === "" || cleanedDto.supplierId === null || cleanedDto.supplierId === undefined) {
    delete cleanedDto.supplierId;
  }

  const formattedData = toSnakeCase(cleanedDto);

  // After toSnakeCase, ensure empty strings are removed from snake_case keys too
  if (formattedData.category_id === "" || formattedData.category_id === null || formattedData.category_id === undefined) {
    delete formattedData.category_id;
  }
  if (formattedData.unit_id === "" || formattedData.unit_id === null || formattedData.unit_id === undefined) {
    delete formattedData.unit_id;
  }
  if (formattedData.sku === "" || formattedData.sku === null || formattedData.sku === undefined) {
    delete formattedData.sku;
  }
  if (formattedData.supplier_id === "" || formattedData.supplier_id === null || formattedData.supplier_id === undefined) {
    delete formattedData.supplier_id;
  }

  // Ensure name is trimmed and not empty
  if (!formattedData.name || !formattedData.name.trim()) {
    const error: any = new Error('El nombre del producto es requerido');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  formattedData.name = formattedData.name.trim();

  // Check for duplicate name before attempting to create (unicidad basada en tenant_id + name)
  // Use exact match (same as MongoDB unique index) to avoid false positives
  if (formattedData.name && formattedData.tenant_id) {
    const existingProduct = await Product.findOne({
      tenant_id: formattedData.tenant_id,
      name: formattedData.name
    }).lean();

    if (existingProduct) {
      const error: any = new Error('Ya existe un producto con este nombre en tu tenant. Por favor, utiliza un nombre diferente.');
      error.code = 11000;
      error.keyPattern = { tenant_id: 1, name: 1 };
      error.keyValue = { tenant_id: formattedData.tenant_id, name: formattedData.name };
      throw error;
    }
  }

  try {
    const created = await repo.create(formattedData);
    return created;
  } catch (error: any) {
    // If MongoDB throws duplicate key error, it means our check missed it (race condition or case sensitivity issue)
    // Convert it to a user-friendly message
    if (error.code === 11000 || error.code === 'E11000' || error.codeName === 'DuplicateKey') {
      // Check if it's a name duplicate
      if (error.keyPattern?.name || (error.keyValue && error.keyValue.name)) {
        const friendlyError: any = new Error('Ya existe un producto con este nombre en tu tenant. Por favor, utiliza un nombre diferente.');
        friendlyError.code = 11000;
        friendlyError.keyPattern = { tenant_id: 1, name: 1 };
        friendlyError.keyValue = error.keyValue || { name: formattedData.name };
        throw friendlyError;
      }
      // Check if it's a sku duplicate (shouldn't happen anymore but handle it)
      if (error.keyPattern?.sku || (error.keyValue && error.keyValue.sku)) {
        const friendlyError: any = new Error('Ya existe un producto con este SKU. Por favor, utiliza un SKU diferente.');
        friendlyError.code = 11000;
        throw friendlyError;
      }
    }
    throw error;
  }
}

async function update(id: string, dto: ProductUpdateDTO) {
  // Clean empty strings for optional ObjectId fields - remove them
  const cleanedDto: any = { ...dto };

  // Remove empty strings, null, or undefined for optional fields
  if (cleanedDto.categoryId === "" || cleanedDto.categoryId === null || cleanedDto.categoryId === undefined) {
    delete cleanedDto.categoryId;
  }
  if (cleanedDto.unitId === "" || cleanedDto.unitId === null || cleanedDto.unitId === undefined) {
    delete cleanedDto.unitId;
  }
  if (cleanedDto.sku === "" || cleanedDto.sku === null || cleanedDto.sku === undefined) {
    delete cleanedDto.sku;
  }
  if (cleanedDto.supplierId === "" || cleanedDto.supplierId === null || cleanedDto.supplierId === undefined) {
    delete cleanedDto.supplierId;
  }

  const formattedData = toSnakeCase(cleanedDto);

  // After toSnakeCase, ensure empty strings are removed from snake_case keys too
  if (formattedData.category_id === "" || formattedData.category_id === null || formattedData.category_id === undefined) {
    delete formattedData.category_id;
  }
  if (formattedData.unit_id === "" || formattedData.unit_id === null || formattedData.unit_id === undefined) {
    delete formattedData.unit_id;
  }
  if (formattedData.sku === "" || formattedData.sku === null || formattedData.sku === undefined) {
    delete formattedData.sku;
  }
  if (formattedData.supplier_id === "" || formattedData.supplier_id === null || formattedData.supplier_id === undefined) {
    delete formattedData.supplier_id;
  }

  // Check for duplicate name before attempting to update (skip if updating the same product)
  if (formattedData.name && formattedData.tenant_id) {
    const existingProduct = await Product.findOne({
      tenant_id: formattedData.tenant_id,
      name: formattedData.name.trim(),
      _id: { $ne: id } // Exclude the current product being updated
    }).lean();

    if (existingProduct) {
      const error: any = new Error('Ya existe otro producto con este nombre en tu tenant. Por favor, utiliza un nombre diferente.');
      error.code = 11000;
      error.keyPattern = { tenant_id: 1, name: 1 };
      error.keyValue = { tenant_id: formattedData.tenant_id, name: formattedData.name };
      throw error;
    }
  }

  return repo.update(id, formattedData);
}

async function remove(id: string) {
  return repo.delete(id);
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
 * Busca o crea una categoría por nombre
 */
async function findOrCreateCategory(tenantId: string, categoryName: string | null, userId: string): Promise<string> {
  // Si no hay nombre de categoría, usar "BIEN" por defecto
  const name = categoryName ? categoryName.trim() : 'BIEN';

  // Buscar categoría existente (case insensitive)
  let category = await Category.findOne({
    tenant_id: tenantId,
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  }).lean();

  if (!category) {
    // Crear categoría si no existe
    category = await Category.create({
      tenant_id: tenantId,
      name: name,
      description: `Categoría creada automáticamente para importación`,
      created_by: userId,
      updated_by: userId
    });
  }

  return category._id.toString();
}

/**
 * Busca o crea una unidad de medida por nombre
 */
async function findOrCreateUnit(tenantId: string, unitName: string | null, userId: string): Promise<string> {
  // Si no hay nombre de unidad, usar "UNIDADES" por defecto
  let name = unitName ? unitName.trim() : 'UNIDADES';

  // Primero buscar en el tenant específico (case insensitive)
  let unit = await UnitOfMeasure.findOne({
    tenant_id: tenantId,
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  }).lean();

  // Si no se encuentra, buscar en unidades por defecto (tenant_id: "default")
  if (!unit) {
    unit = await UnitOfMeasure.findOne({
      tenant_id: 'default',
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    }).lean();
  }

  // Si aún no se encuentra, crear la unidad
  if (!unit) {
    // Generar código único basado en el nombre (máximo 4 caracteres)
    let code = name.substring(0, 4).toUpperCase().replace(/\s/g, '').replace(/[^A-Z0-9]/g, '');
    if (!code || code.length === 0) {
      code = 'UN';
    }

    // Verificar si el código ya existe para este tenant
    let existingUnitWithCode = await UnitOfMeasure.findOne({
      tenant_id: tenantId,
      code: code
    }).lean();

    // Si el código existe, agregar un número
    if (existingUnitWithCode) {
      let counter = 1;
      let newCode = `${code}${counter}`;
      while (await UnitOfMeasure.findOne({ tenant_id: tenantId, code: newCode }).lean()) {
        counter++;
        newCode = `${code}${counter}`;
      }
      code = newCode;
    }

    unit = await UnitOfMeasure.create({
      tenant_id: tenantId,
      code: code,
      name: name,
      description: `Unidad de medida creada automáticamente para importación`,
      created_by: userId,
      updated_by: userId
    });
  }

  return unit._id.toString();
}

/**
 * Busca o crea un proveedor por defecto para importaciones
 */
async function findOrCreateDefaultSupplier(tenantId: string, userId: string): Promise<string | null> {
  // Buscar proveedor por defecto o cualquier proveedor existente
  let supplier = await Supplier.findOne({
    tenant_id: tenantId
  }).lean();

  if (!supplier) {
    // Crear proveedor por defecto si no existe ninguno
    try {
      supplier = await Supplier.create({
        tenant_id: tenantId,
        name: 'Proveedor General',
        created_by: userId,
        updated_by: userId
      });
    } catch (error) {
      console.error('Error creando proveedor por defecto:', error);
      // Si falla, retornar null para que el producto se cree sin supplier
      return null;
    }
  }

  return supplier._id.toString();
}

/**
 * Importa productos desde un archivo CSV o Excel de Keyfacil
 */
async function importFromKeyfacil(
  fileBuffer: Buffer,
  fileName: string,
  userId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const tenantId = await getTenantId(userId);

  // Parsear el archivo
  const { products, errors: parseErrors } = parseKeyfacilProductsFile(fileBuffer, fileName);

  let totalSuccess = 0;
  let totalFailed = 0;
  const errors: string[] = [...parseErrors];

  // Procesar cada producto
  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    try {
      // Verificar si el producto ya existe por nombre (unicidad basada en nombre)
      const existingProduct = await Product.findOne({
        tenant_id: tenantId,
        name: product.descripcion.trim()
      }).lean();

      if (existingProduct) {
        // Producto ya existe, saltarlo
        errors.push(`Producto ${i + 1} (Nombre: ${product.descripcion}): Ya existe en el sistema`);
        continue;
      }

      // Buscar o crear categoría
      const categoryId = await findOrCreateCategory(tenantId, product.categoria, userId);

      // Buscar o crear unidad de medida
      const unitId = await findOrCreateUnit(tenantId, product.unidadDeMedida, userId);

      // Buscar o crear proveedor por defecto
      const supplierId = await findOrCreateDefaultSupplier(tenantId, userId);

      // Usar PRECIO UNITARIO para ambos purchase_price y sale_price
      const precioUnitario = typeof product.precioUnitario === 'number'
        ? product.precioUnitario
        : parseFloat(String(product.precioUnitario)) || 0;

      // Usar subUnitsPerUnit del producto parseado, con valor por defecto 1
      const subUnitsPerUnit = product.subUnitsPerUnit && product.subUnitsPerUnit > 0
        ? product.subUnitsPerUnit
        : 1;

      // Preparar datos del producto
      const productData: any = {
        tenant_id: tenantId,
        category_id: categoryId || null,
        unit_id: unitId || null,
        sku: product.codigo.trim() || null,
        name: product.descripcion.trim(),
        purchase_price: precioUnitario || null,
        sale_price: precioUnitario || null,
        sub_units_per_unit: subUnitsPerUnit,
        is_active: true,
        metadata: {
          moneda: product.moneda,
          keyfacil_import: true
        },
        created_by: userId,
        updated_by: userId
      };

      // Solo agregar supplier_id si existe
      if (supplierId) {
        productData.supplier_id = supplierId;
      }

      // Crear nuevo producto
      const newProduct = await Product.create(productData);

      totalSuccess++;
    } catch (error: any) {
      totalFailed++;
      const errorMsg = error.message || 'Error desconocido';

      // Si es error de duplicado (SKU único)
      if (error.code === 11000) {
        errors.push(`Producto ${i + 1} (SKU: ${product.codigo}): Ya existe en el sistema`);
      } else {
        errors.push(`Producto ${i + 1} (SKU: ${product.codigo}): ${errorMsg}`);
      }
      console.error(`Error creando producto ${i + 1}:`, error);
    }
  }

  return { success: totalSuccess, failed: totalFailed, errors };
}

module.exports = {
  getAll,
  getMostSold,
  getOne,
  getByBarcode,
  create,
  update,
  remove,
  importFromKeyfacil,
  getTenantId
};
