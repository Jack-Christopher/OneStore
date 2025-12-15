export { }; // Empty export to force module scope

import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

/**
 * Interfaz para un producto parseado
 */
export interface ParsedProduct {
  codigo: string;
  producto: string;
  principal: string | null;
  sucursal: string | null;
}

/**
 * Normaliza valores "-" a null o string vacío según el tipo esperado
 */
function normalizeValue(value: any, isNumeric = false): any {
  // Si es numérico y ya es un número válido, retornarlo directamente
  if (isNumeric && typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  // Manejar objetos vacíos o inválidos
  if (value !== null && value !== undefined && typeof value === 'object') {
    if (Object.keys(value).length === 0) {
      return isNumeric ? 0 : null;
    }
    value = String(value);
  }

  if (value === null || value === undefined) {
    return isNumeric ? 0 : null;
  }

  const strValue = String(value).trim();

  if (strValue === '-' || strValue === '' || strValue === 'null' || strValue === 'undefined' || strValue === '{}' || strValue === '[]') {
    return isNumeric ? 0 : null;
  }

  if (isNumeric) {
    // Remover espacios y comas, luego parsear
    const cleaned = strValue.replace(/,/g, '').replace(/\s/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  return strValue;
}

/**
 * Detecta automáticamente dónde empiezan los headers en el CSV/Excel
 */
function findHeaderRow(lines: string[]): number {
  const headerKeywords = ['CÓDIGO', 'CODIGO', 'PRODUCTO', 'PRINCIPAL', 'SUCURSAL'];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toUpperCase();
    const matches = headerKeywords.filter(keyword => line.includes(keyword)).length;

    // Si encuentra al menos 2 palabras clave, probablemente es el header
    if (matches >= 2) {
      return i;
    }
  }

  // Por defecto, intentar fila 2 (index 1)
  return 1;
}

/**
 * Parsea un archivo Excel y retorna los datos raw
 */
function parseExcelRaw(buffer: Buffer): any[][] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir a array de arrays (raw data)
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false,
      blankrows: false,
    });

    return data as any[][];
  } catch (error: any) {
    throw new Error(`Error al parsear archivo Excel: ${error.message}`);
  }
}

/**
 * Convierte datos raw de Excel a formato similar a CSV (array de objetos)
 */
function excelToCSVFormat(excelRawData: any[][]): { headers: string[]; records: any[] } {
  if (excelRawData.length === 0) {
    return { headers: [], records: [] };
  }

  // Encontrar la fila donde empiezan los headers
  const headerKeywords = ['CÓDIGO', 'CODIGO', 'PRODUCTO', 'PRINCIPAL', 'SUCURSAL'];
  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(5, excelRawData.length); i++) {
    const row = excelRawData[i];
    const rowStr = row.map(v => String(v).toUpperCase()).join('|');
    const matches = headerKeywords.filter(keyword => rowStr.includes(keyword)).length;

    if (matches >= 2) {
      headerRowIndex = i;
      break;
    }
  }

  // Obtener headers de la fila encontrada
  const headers = excelRawData[headerRowIndex].map(v => String(v).trim()).filter(v => v !== '');

  // Obtener registros (desde la siguiente fila después de los headers)
  const records = excelRawData.slice(headerRowIndex + 1)
    .filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined))
    .map(row => {
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '';
      });
      return record;
    });

  return { headers, records };
}

/**
 * Parsea un archivo CSV o Excel de Keyfacil y retorna los productos
 */
export function parseKeyfacilProductsFile(
  buffer: Buffer,
  fileName: string
): {
  products: ParsedProduct[];
  errors: string[];
} {
  const errors: string[] = [];
  const products: ParsedProduct[] = [];

  try {
    // Detectar tipo de archivo por extensión
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    let records: any[] = [];
    let headers: string[] = [];

    if (isExcel) {
      // Procesar como Excel
      const excelRawData = parseExcelRaw(buffer);
      const result = excelToCSVFormat(excelRawData);
      headers = result.headers;
      records = result.records;
    } else {
      // Procesar como CSV
      const content = buffer.toString('utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');

      if (lines.length === 0) {
        errors.push('El archivo está vacío');
        return { products, errors };
      }

      // Encontrar la fila donde empiezan los headers
      const headerRowIndex = findHeaderRow(lines);

      // Leer desde la fila de headers
      const csvContent = lines.slice(headerRowIndex).join('\n');

      // Parsear CSV
      const parsedRecords = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        cast: false,
      });

      if (parsedRecords.length === 0) {
        errors.push('No se encontraron registros en el archivo');
        return { products, errors };
      }

      const firstRecord = parsedRecords[0] as any;
      headers = Object.keys(firstRecord);
      records = parsedRecords;
    }

    if (records.length === 0) {
      errors.push('No se encontraron registros en el archivo');
      return { products, errors };
    }

    // Procesar registros
    for (let i = 0; i < records.length; i++) {
      try {
        const record = records[i];

        // Saltar registros completamente vacíos
        const hasData = Object.values(record).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object' && val !== null && Object.keys(val as object).length === 0) return false;
          const strVal = String(val).trim();
          return strVal !== '' && strVal !== '-' && strVal !== 'null' && strVal !== 'undefined' && strVal !== '{}' && strVal !== '[]';
        });

        if (!hasData) {
          continue;
        }

        // Normalizar nombres de columnas (case insensitive)
        const normalizedRecord: any = {};
        for (const key in record) {
          const normalizedKey = key.trim().toUpperCase();
          normalizedRecord[normalizedKey] = record[key];
        }

        // Extraer campos
        const codigo = normalizeValue(normalizedRecord['CÓDIGO'] || normalizedRecord['CODIGO'] || '') || '';
        const producto = normalizeValue(normalizedRecord['PRODUCTO'] || '') || '';
        const principal = normalizeValue(normalizedRecord['PRINCIPAL'] || '');
        const sucursal = normalizeValue(normalizedRecord['SUCURSAL'] || '');

        // Validar campos requeridos
        if (!codigo) {
          errors.push(`Registro ${i + 1}: Falta CÓDIGO`);
          continue;
        }

        if (!producto) {
          errors.push(`Registro ${i + 1}: Falta PRODUCTO`);
          continue;
        }

        // Agregar producto
        products.push({
          codigo: codigo.trim(),
          producto: producto.trim(),
          principal: principal,
          sucursal: sucursal,
        });
      } catch (error: any) {
        errors.push(`Error procesando registro ${i + 1}: ${error.message}`);
      }
    }

    return { products, errors };
  } catch (error: any) {
    errors.push(`Error parseando archivo: ${error.message}`);
    return { products, errors };
  }
}

