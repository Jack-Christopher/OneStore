export { }; // Empty export to force module scope

import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

/**
 * Interfaz para un item de compra parseado
 */
export interface ParsedPurchaseItem {
  identificador: string;
  proveedor_doc: string;
  proveedor_nombre: string;
  comprobante: string;
  serie: string;
  numero: string;
  fecha: Date | null;
  codigo_producto: string;
  producto: string;
  detalle_adicional: string | null;
  cantidad: number;
  moneda: string;
  precio_unitario: number;
  total_linea: number;
  total_compra: number;
  observaciones: string | null;
  otros: string | null;
}

/**
 * Interfaz para una compra agrupada con sus items
 */
export interface ParsedPurchase {
  identificador: string;
  proveedor_doc: string;
  proveedor_nombre: string;
  comprobante: string;
  serie: string;
  numero: string;
  fecha: Date | null;
  moneda: string;
  total_compra: number;
  observaciones: string | null;
  otros: string | null;
  items: ParsedPurchaseItem[];
}

/**
 * Convierte fecha peruana (DD/MM/YYYY) a Date
 */
function parsePeruvianDate(dateValue: any): Date | null {
  // Manejar objetos vacíos o inválidos
  if (dateValue !== null && dateValue !== undefined && typeof dateValue === 'object') {
    if (Object.keys(dateValue).length === 0) {
      return null;
    }
    dateValue = String(dateValue);
  }

  if (!dateValue || dateValue === '-' || dateValue === '{}' || dateValue === '[]') {
    return null;
  }

  const dateStr = String(dateValue).trim();

  if (dateStr === '' || dateStr === 'null' || dateStr === 'undefined') {
    return null;
  }

  try {
    // Si es un número (fecha serial de Excel), convertirla
    if (!isNaN(Number(dateStr)) && !dateStr.includes('/')) {
      const excelDate = Number(dateStr);
      // Fechas de Excel son días desde el 1 de enero de 1900
      if (excelDate > 1 && excelDate < 100000) {
        const baseDate = new Date(1900, 0, 1);
        const days = excelDate - 2; // Excel tiene un bug: cuenta 1900 como año bisiesto
        baseDate.setDate(baseDate.getDate() + days);
        return baseDate;
      } else if (excelDate > 1000000000000) {
        // Probablemente es un timestamp en milisegundos
        return new Date(excelDate);
      }
    }

    // Formato: DD/MM/YYYY o DD/MM/YYYY HH:MM AM/PM
    const parts = dateStr.split(' ');
    const datePart = parts[0]; // DD/MM/YYYY
    const timePart = parts.length > 1 ? parts.slice(1).join(' ') : null;

    // Intentar parsear como DD/MM/YYYY
    const dateMatch = datePart.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const year = parseInt(dateMatch[3]);

      let date = new Date(year, month - 1, day);

      // Si hay hora, parsearla
      if (timePart) {
        const timeMatch = timePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const ampm = timeMatch[3].toUpperCase();

          if (ampm === 'PM' && hours !== 12) {
            hours += 12;
          } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
          }

          date.setHours(hours, minutes, 0, 0);
        }
      }

      return date;
    }

    // Intentar parsear como fecha ISO o formato estándar
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    return null;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
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
 * Extrae cantidad y moneda del campo "CANTIDAD MONEDA" (ej: "6.00 PEN" -> { cantidad: 6.00, moneda: "PEN" })
 */
function parseCantidadMoneda(value: any): { cantidad: number; moneda: string } {
  if (!value || value === '-' || value === '{}' || value === '[]') {
    return { cantidad: 0, moneda: 'PEN' };
  }

  const strValue = String(value).trim();
  if (strValue === '' || strValue === '-') {
    return { cantidad: 0, moneda: 'PEN' };
  }

  // Intentar extraer cantidad y moneda
  // Formatos posibles: "6.00 PEN", "6 PEN", "6.00", "6.00PEN", etc.
  // Regex mejorado: busca número (con decimales) seguido opcionalmente de espacios y 3 letras (moneda)
  const match = strValue.match(/^([\d.,]+)\s*([A-Z]{2,3})?$/i);
  if (match) {
    const cantidadStr = match[1].replace(/,/g, '');
    const cantidad = parseFloat(cantidadStr);
    const moneda = match[2] ? match[2].toUpperCase() : 'PEN';

    if (!isNaN(cantidad) && cantidad > 0) {
      return { cantidad, moneda };
    }
  }

  // Si no coincide con el patrón, intentar extraer solo el número (puede estar al inicio)
  const numberMatch = strValue.match(/[\d.,]+/);
  if (numberMatch) {
    const cantidad = parseFloat(numberMatch[0].replace(/,/g, ''));
    if (!isNaN(cantidad) && cantidad > 0) {
      return { cantidad, moneda: 'PEN' };
    }
  }

  // Si todo falla, retornar 0
  return { cantidad: 0, moneda: 'PEN' };
}

/**
 * Detecta automáticamente dónde empiezan los headers en el CSV/Excel
 */
function findHeaderRow(lines: string[]): number {
  const headerKeywords = ['IDENTIFICADOR', 'PROVEEDOR', 'COMPROBANTE', 'SERIE', 'NUMERO', 'FECHA', 'CODIGO PRODUCTO', 'PRODUCTO'];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toUpperCase();
    const matches = headerKeywords.filter(keyword => line.includes(keyword)).length;

    // Si encuentra al menos 3 palabras clave, probablemente es el header
    if (matches >= 3) {
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
  const headerKeywords = ['IDENTIFICADOR', 'PROVEEDOR', 'COMPROBANTE', 'SERIE', 'NUMERO', 'FECHA', 'CODIGO PRODUCTO'];
  let headerRowIndex = 0;

  for (let i = 0; i < Math.min(5, excelRawData.length); i++) {
    const row = excelRawData[i];
    const rowStr = row.map(v => String(v).toUpperCase()).join('|');
    const matches = headerKeywords.filter(keyword => rowStr.includes(keyword)).length;

    if (matches >= 3) {
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
 * Parsea un archivo CSV o Excel de Keyfacil y retorna las compras agrupadas
 */
export function parseKeyfacilPurchasesFile(
  buffer: Buffer,
  fileName: string
): {
  purchases: ParsedPurchase[];
  errors: string[];
} {
  const errors: string[] = [];
  const purchases: ParsedPurchase[] = [];

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
        return { purchases, errors };
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
        return { purchases, errors };
      }

      const firstRecord = parsedRecords[0] as any;
      headers = Object.keys(firstRecord);
      records = parsedRecords;
    }

    if (records.length === 0) {
      errors.push('No se encontraron registros en el archivo');
      return { purchases, errors };
    }

    // Procesar registros y agrupar por compra
    const purchaseMap = new Map<string, ParsedPurchase>();

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
        const identificador = normalizeValue(normalizedRecord['IDENTIFICADOR'] || '') || '';
        const proveedorDoc = normalizeValue(normalizedRecord['PROVEEDOR DOC'] || normalizedRecord['PROVEEDOR_DOC'] || '') || '';
        const proveedorNombre = normalizeValue(normalizedRecord['PROVEEDOR NOMBRE'] || normalizedRecord['PROVEEDOR_NOMBRE'] || '') || '';
        const comprobante = normalizeValue(normalizedRecord['COMPROBANTE'] || '') || '';
        const serie = normalizeValue(normalizedRecord['SERIE'] || '') || '';
        const numero = normalizeValue(normalizedRecord['NUMERO'] || normalizedRecord['NÚMERO'] || '') || '';
        const fecha = parsePeruvianDate(normalizedRecord['FECHA'] || '');
        const codigoProducto = normalizeValue(normalizedRecord['CODIGO PRODUCTO'] || normalizedRecord['CODIGO_PRODUCTO'] || '') || '';
        const producto = normalizeValue(normalizedRecord['PRODUCTO'] || '') || '';
        const detalleAdicional = normalizeValue(normalizedRecord['DETALLE ADICIONAL'] || normalizedRecord['DETALLE_ADICIONAL'] || '');

        // Intentar obtener cantidad de diferentes campos posibles
        let cantidadMoneda = parseCantidadMoneda(normalizedRecord['CANTIDAD MONEDA'] || normalizedRecord['CANTIDAD_MONEDA'] || '');
        let cantidad = cantidadMoneda.cantidad;

        // Si no hay cantidad en CANTIDAD MONEDA, buscar campo CANTIDAD separado
        if (cantidad === 0) {
          const cantidadDirecta = normalizeValue(normalizedRecord['CANTIDAD'] || '', true) || 0;
          if (cantidadDirecta > 0) {
            cantidad = cantidadDirecta;
            // Intentar obtener moneda de CANTIDAD MONEDA si existe
            const cantidadMonedaField = normalizedRecord['CANTIDAD MONEDA'] || normalizedRecord['CANTIDAD_MONEDA'] || '';
            if (cantidadMonedaField) {
              cantidadMoneda = parseCantidadMoneda(cantidadMonedaField);
            }
          }
        }

        const precioUnitario = normalizeValue(
          normalizedRecord['P. UNITARIO'] ||
          normalizedRecord['P. UNITARI'] ||
          normalizedRecord['P_UNITARIO'] ||
          normalizedRecord['P_UNITARI'] ||
          normalizedRecord['PRECIO UNITARIO'] ||
          normalizedRecord['PRECIO_UNITARIO'] ||
          '',
          true
        ) || 0;
        const totalLinea = normalizeValue(normalizedRecord['TOTAL LINE'] || normalizedRecord['TOTAL_LINE'] || normalizedRecord['TOTAL LINEA'] || normalizedRecord['TOTAL_LINEA'] || '', true) || 0;
        const totalCompra = normalizeValue(normalizedRecord['TOTAL COMPRA'] || normalizedRecord['TOTAL_COMPRA'] || '', true) || 0;

        // Si cantidad es 0 pero tenemos precio_unitario y total_linea, calcular cantidad
        if (cantidad === 0 && precioUnitario > 0 && totalLinea > 0) {
          cantidad = totalLinea / precioUnitario;
          // Redondear a 2 decimales
          cantidad = Math.round(cantidad * 100) / 100;
        }

        // Debug: Log si hay valores problemáticos
        if (cantidad === 0 || precioUnitario === 0) {
          console.log(`Debug registro ${i + 1}:`, {
            'CANTIDAD MONEDA raw': normalizedRecord['CANTIDAD MONEDA'] || normalizedRecord['CANTIDAD_MONEDA'],
            'CANTIDAD raw': normalizedRecord['CANTIDAD'],
            'P. UNITARI raw': normalizedRecord['P. UNITARI'] || normalizedRecord['P_UNITARI'] || normalizedRecord['PRECIO UNITARIO'] || normalizedRecord['PRECIO_UNITARIO'],
            'TOTAL LINE raw': normalizedRecord['TOTAL LINE'] || normalizedRecord['TOTAL_LINE'] || normalizedRecord['TOTAL LINEA'] || normalizedRecord['TOTAL_LINEA'],
            cantidad,
            precioUnitario,
            totalLinea,
            codigoProducto
          });
        }
        const observaciones = normalizeValue(normalizedRecord['OBSERVACIONES'] || '');
        const otros = normalizeValue(normalizedRecord['OTROS'] || '');

        // Validar campos requeridos
        if (!identificador && !serie && !numero) {
          errors.push(`Registro ${i + 1}: Faltan campos requeridos (IDENTIFICADOR o SERIE+NUMERO)`);
          continue;
        }

        if (!proveedorDoc) {
          errors.push(`Registro ${i + 1}: Falta PROVEEDOR DOC`);
          continue;
        }

        if (!codigoProducto) {
          errors.push(`Registro ${i + 1}: Falta CODIGO PRODUCTO`);
          continue;
        }

        // Validar que haya nombre de producto o usar código como fallback
        if (!producto || producto.trim() === '') {
          // No es un error crítico, se usará el código como nombre en el servicio
        }

        // Crear clave única para agrupar compras
        // Usar IDENTIFICADOR si existe, sino SERIE-NUMERO-FECHA
        const purchaseKey = identificador || `${serie}-${numero}-${fecha ? fecha.toISOString().split('T')[0] : ''}`;

        // Crear o obtener compra
        if (!purchaseMap.has(purchaseKey)) {
          purchaseMap.set(purchaseKey, {
            identificador: identificador || `${serie}-${numero}`,
            proveedor_doc: proveedorDoc,
            proveedor_nombre: proveedorNombre,
            comprobante: comprobante,
            serie: serie,
            numero: numero,
            fecha: fecha,
            moneda: cantidadMoneda.moneda,
            total_compra: totalCompra,
            observaciones: observaciones,
            otros: otros,
            items: [],
          });
        }

        const purchase = purchaseMap.get(purchaseKey)!;

        // Agregar item a la compra
        purchase.items.push({
          identificador: identificador || `${serie}-${numero}`,
          proveedor_doc: proveedorDoc,
          proveedor_nombre: proveedorNombre,
          comprobante: comprobante,
          serie: serie,
          numero: numero,
          fecha: fecha,
          codigo_producto: codigoProducto,
          producto: producto,
          detalle_adicional: detalleAdicional,
          cantidad: cantidad,
          moneda: cantidadMoneda.moneda,
          precio_unitario: precioUnitario,
          total_linea: totalLinea,
          total_compra: totalCompra,
          observaciones: observaciones,
          otros: otros,
        });

        // Actualizar total de compra si es mayor (por si hay múltiples items)
        if (totalCompra > purchase.total_compra) {
          purchase.total_compra = totalCompra;
        }
      } catch (error: any) {
        errors.push(`Error procesando registro ${i + 1}: ${error.message}`);
      }
    }

    // Convertir map a array
    purchases.push(...Array.from(purchaseMap.values()));

    return { purchases, errors };
  } catch (error: any) {
    errors.push(`Error parseando archivo: ${error.message}`);
    return { purchases, errors };
  }
}

