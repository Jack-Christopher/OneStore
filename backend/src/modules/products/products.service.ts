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

      // Buscar o crear categoría
      const categoryId = await findOrCreateCategory(tenantId, product.categoria, userId);
      
      // Buscar o crear unidad de medida
      const unitId = await findOrCreateUnit(tenantId, product.unidadDeMedida, userId);

      // Usar PRECIO UNITARIO para ambos purchase_price y sale_price
      const precioUnitario = typeof product.precioUnitario === 'number' 
        ? product.precioUnitario 
        : parseFloat(String(product.precioUnitario)) || 0;

      // Usar subUnitsPerUnit del producto parseado, con valor por defecto 1
      const subUnitsPerUnit = product.subUnitsPerUnit && product.subUnitsPerUnit > 0 
        ? product.subUnitsPerUnit 
        : 1;

      // Crear nuevo producto
      const newProduct = await Product.create({
        tenant_id: tenantId,
        category_id: categoryId,
        unit_id: unitId,
        sku: product.codigo.trim(),
        name: product.descripcion.trim(),
        purchase_price: precioUnitario,
        sale_price: precioUnitario,
        sub_units_per_unit: subUnitsPerUnit,
        is_active: true,
        metadata: {
          moneda: product.moneda,
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
