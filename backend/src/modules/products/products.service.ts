import { ProductUpdateDTO } from "./products.types";
import { toSnakeCase } from "../../shared/utils/object";
import { Double } from 'mongodb';
import { parseKeyfacilProductsFile } from "./keyfacil-products-parser";

const repo = require("./products.repository");
const Product = require("../../database/models/Product");
const Category = require("../../database/models/Category");
const UnitOfMeasure = require("../../database/models/UnitOfMeasure");
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

async function create(dto: ProductUpdateDTO) {
  const formattedData = toSnakeCase(dto);
  return repo.create(formattedData);
}

async function update(id: string, dto: ProductUpdateDTO) {
  const formattedData = toSnakeCase(dto);
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
 * Busca o crea una categoría por defecto
 */
async function findOrCreateDefaultCategory(tenantId: string, userId: string): Promise<string> {
  let category = await Category.findOne({ tenant_id: tenantId }).lean();
  
  if (!category) {
    // Crear categoría por defecto si no existe
    category = await Category.create({
      tenant_id: tenantId,
      name: 'Categoría General',
      description: 'Categoría creada automáticamente para importación',
      created_by: userId,
      updated_by: userId
    });
  }

  return category._id.toString();
}

/**
 * Busca o crea una unidad de medida por defecto
 */
async function findOrCreateDefaultUnit(tenantId: string, userId: string): Promise<string> {
  let unit = await UnitOfMeasure.findOne({
    $or: [
      { tenant_id: tenantId },
      { tenant_id: 'default' }
    ]
  }).lean();
  
  if (!unit) {
    // Crear unidad de medida por defecto si no existe
    unit = await UnitOfMeasure.create({
      tenant_id: tenantId,
      code: 'UN',
      name: 'Unidad',
      description: 'Unidad de medida creada automáticamente para importación',
      created_by: userId,
      updated_by: userId
    });
  }

  return unit._id.toString();
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
  
  // Obtener categoría y unidad por defecto
  const defaultCategoryId = await findOrCreateDefaultCategory(tenantId, userId);
  const defaultUnitId = await findOrCreateDefaultUnit(tenantId, userId);

  // Parsear el archivo
  const { products, errors: parseErrors } = parseKeyfacilProductsFile(fileBuffer, fileName);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  const errors: string[] = [...parseErrors];

  // Procesar cada producto
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      // Verificar si el producto ya existe por SKU
      const existingProduct = await Product.findOne({ 
        tenant_id: tenantId, 
        sku: product.codigo.trim() 
      }).lean();

      if (existingProduct) {
        // Producto ya existe, saltarlo
        errors.push(`Producto ${i + 1} (SKU: ${product.codigo}): Ya existe en el sistema`);
        continue;
      }

      // Crear nuevo producto
      const newProduct = await Product.create({
        tenant_id: tenantId,
        category_id: defaultCategoryId,
        unit_id: defaultUnitId,
        sku: product.codigo.trim(),
        name: product.producto.trim(),
        sale_price: 0, // Precio de venta por defecto
        is_active: true,
        metadata: {
          principal: product.principal,
          sucursal: product.sucursal,
          keyfacil_import: true
        },
        created_by: userId,
        updated_by: userId
      });

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
  create,
  update,
  remove,
  importFromKeyfacil
};
