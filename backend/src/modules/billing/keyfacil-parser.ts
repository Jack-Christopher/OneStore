export { }; // Empty export to force module scope

import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { BillingDocumentType } from './billing.types';

/**
 * Detecta el tipo de documento basado en las columnas presentes
 */
function detectDocumentType(headers: string[]): BillingDocumentType | null {
  const headerStr = headers.join('|').toUpperCase();

  // Notas de crédito y débito tienen "DOCUMENTO AFECTADO" y "MOTIVO"
  if (headerStr.includes('DOCUMENTO AFECTADO') && headerStr.includes('MOTIVO')) {
    if (headerStr.includes('CREDITO')) {
      return 'credit_note';
    } else if (headerStr.includes('DEBITO')) {
      return 'debit_note';
    }
    // Por defecto, si tiene documento afectado y motivo, es crédito
    return 'credit_note';
  }

  // Facturas y Boletas tienen DETRACCIÓN, RETENCIÓN, PERCEPCIÓN, ESTADO SUNAT
  if (headerStr.includes('DETRACCIÓN') || headerStr.includes('RETENCIÓN') || headerStr.includes('PERCEPCIÓN')) {
    if (headerStr.includes('FACTURA') || headerStr.includes('SERIE') && headerStr.includes('ESTADO SUNAT')) {
      return 'invoice';
    }
    return 'sale_ticket';
  }

  // Proformas no tienen DETRACCIÓN, RETENCIÓN, PERCEPCIÓN, ni ESTADO SUNAT
  if (headerStr.includes('PROFORMA') || (!headerStr.includes('DETRACCIÓN') && !headerStr.includes('ESTADO SUNAT'))) {
    if (headerStr.includes('PROFORMA')) {
      return 'proforma';
    }
  }

  // Notas de venta no tienen DETRACCIÓN, RETENCIÓN, PERCEPCIÓN
  if (!headerStr.includes('DETRACCIÓN') && !headerStr.includes('RETENCIÓN') && !headerStr.includes('PERCEPCIÓN') && !headerStr.includes('ESTADO SUNAT')) {
    if (headerStr.includes('NOTA') && headerStr.includes('VENTA')) {
      return 'sale_note';
    }
  }

  // Por defecto, si tiene ORDEN DE COMPRA y no tiene DETRACCIÓN, puede ser proforma o nota de venta
  if (headerStr.includes('ORDEN DE COMPRA')) {
    if (headerStr.includes('ESTADO SUNAT')) {
      return 'invoice';
    }
    return 'sale_note';
  }

  return null;
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
      // Pero necesitamos verificar si es realmente una fecha de Excel o un timestamp
      if (excelDate > 1 && excelDate < 100000) {
        // Probablemente es una fecha serial de Excel
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
  // Manejar objetos vacíos o inválidos
  if (value !== null && value !== undefined && typeof value === 'object') {
    if (Object.keys(value).length === 0) {
      return isNumeric ? 0 : null;
    }
    // Si es un objeto con contenido, intentar convertir a string
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
    const num = parseFloat(strValue.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }

  return strValue;
}

/**
 * Detecta automáticamente dónde empiezan los headers en el CSV de Keyfacil
 * Generalmente en fila 2 (index 1) para facturas, fila 3 (index 2) para otros
 */
function findHeaderRow(lines: string[]): number {
  // Buscar filas que contengan palabras clave de headers
  const headerKeywords = ['SERIE', 'NÚMERO', 'CLIENTE', 'FECHA', 'TOTAL'];

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
 * Mapea nombres de columnas de Keyfacil a snake_case
 */
function mapKeyfacilField(keyfacilField: string): string {
  const mapping: Record<string, string> = {
    'SERIE': 'serie',
    'NÚMERO': 'numero',
    'SUCURSAL': 'sucursal',
    'CLIENTE DOC': 'cliente_doc',
    'CLIENTE NOMBRE': 'cliente_nombre',
    'FECHA DE EMISION': 'fecha_emision',
    'FECHA DE VENCIMIENTO': 'fecha_vencimiento',
    'FECHA DE CREACION': 'fecha_creacion',
    'USUARIO': 'usuario',
    'PLACA VEHICULO': 'placa_vehiculo',
    'ORDEN DE COMPRA': 'orden_compra',
    'GUIAS DE REMISION': 'guias_remision',
    'COND. DE PAGO': 'cond_pago',
    'MET. DE PAGO': 'met_pago',
    'REFERENCIA': 'referencia',
    'CUOTAS': 'cuotas',
    'OBSERVACIONES': 'observaciones',
    'OTROS': 'otros',
    'MONEDA': 'moneda',
    'DETRACCIÓN (PEN)': 'detraccion_pen',
    'RETENCIÓN': 'retencion',
    'PERCEPCIÓN (PEN)': 'percepcion_pen',
    'RC': 'rc',
    'DESCUENTO': 'descuento',
    'GRAVADO': 'gravado',
    'EXONERADO': 'exonerado',
    'INAFECTO': 'inafecto',
    'EXPORTACION': 'exportacion',
    'GRATUITO': 'gratuito',
    'IGV': 'igv',
    'ISC': 'isc',
    'ICBPER': 'icbper',
    'TOTAL': 'total',
    'ANULADO': 'anulado',
    'ESTADO SUNAT': 'estado_sunat',
    'DOCUMENTO AFECTADO': 'documento_afectado',
    'MOTIVO': 'motivo',
  };

  const normalized = keyfacilField.trim().toUpperCase();
  return mapping[normalized] || normalized.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Detecta el tipo de documento basado en el nombre de la hoja
 */
function detectDocumentTypeFromSheetName(sheetName: string): BillingDocumentType | null {
  const normalizedName = sheetName.trim().toUpperCase();

  // Mapeo de nombres comunes de hojas a tipos de documentos
  if (normalizedName.includes('FACTURA') || normalizedName.includes('FACTURAS')) {
    return 'invoice';
  }

  if (normalizedName.includes('BOLETA') || normalizedName.includes('BOLETAS')) {
    return 'sale_ticket';
  }

  if (normalizedName.includes('NOTA') && normalizedName.includes('CREDITO') ||
    normalizedName.includes('NOTA') && normalizedName.includes('CRÉDITO') ||
    normalizedName.includes('CREDITO') || normalizedName.includes('CRÉDITO')) {
    return 'credit_note';
  }

  if (normalizedName.includes('NOTA') && normalizedName.includes('DEBITO') ||
    normalizedName.includes('NOTA') && normalizedName.includes('DÉBITO') ||
    normalizedName.includes('DEBITO') || normalizedName.includes('DÉBITO')) {
    return 'debit_note';
  }

  if (normalizedName.includes('NOTA') && normalizedName.includes('VENTA')) {
    return 'sale_note';
  }

  if (normalizedName.includes('PROFORMA') || normalizedName.includes('PROFORMAS')) {
    return 'proforma';
  }

  return null;
}

/**
 * Parsea un archivo Excel y retorna los datos de todas las hojas con sus nombres
 */
function parseExcelRaw(buffer: Buffer): { sheetName: string; data: any[][] }[] {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Procesar todas las hojas con sus nombres
    const sheetsData: { sheetName: string; data: any[][] }[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a array de arrays (raw data)
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Usar formato array de arrays
        defval: '', // Valor por defecto para celdas vacías
        raw: false, // Convertir números a strings para mantener formato consistente
        blankrows: false, // No incluir filas completamente vacías
      });

      if (data.length > 0) {
        sheetsData.push({ sheetName, data: data as any[][] });
      }
    }

    return sheetsData;
  } catch (error: any) {
    throw new Error(`Error al parsear archivo Excel: ${error.message}`);
  }
}

/**
 * Convierte datos raw de Excel (array de arrays) a formato similar a CSV (array de objetos)
 */
function excelToCSVFormat(excelRawData: any[][]): { headers: string[]; records: any[] } {
  if (excelRawData.length === 0) {
    return { headers: [], records: [] };
  }

  // Encontrar la fila donde empiezan los headers
  const headerKeywords = ['SERIE', 'NÚMERO', 'CLIENTE', 'FECHA', 'TOTAL'];
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
 * Parsea un archivo CSV o Excel de Keyfacil y retorna los documentos procesados agrupados por tipo
 */
export function parseKeyfacilFile(
  buffer: Buffer,
  fileName: string
): {
  documentsByType: Record<BillingDocumentType, any[]>;
  errors: string[];
} {
  const errors: string[] = [];
  const documentsByType: Record<BillingDocumentType, any[]> = {
    invoice: [],
    sale_ticket: [],
    credit_note: [],
    debit_note: [],
    sale_note: [],
    proforma: [],
  };

  try {
    // Detectar tipo de archivo por extensión
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (isExcel) {
      // Procesar como Excel - puede tener múltiples hojas
      const sheetsData = parseExcelRaw(buffer);

      // Procesar cada hoja por separado y detectar su tipo
      for (let sheetIndex = 0; sheetIndex < sheetsData.length; sheetIndex++) {
        const { sheetName, data: sheetRawData } = sheetsData[sheetIndex];
        const result = excelToCSVFormat(sheetRawData);

        if (result.headers.length === 0 || result.records.length === 0) {
          continue; // Saltar hojas vacías
        }

        // Primero intentar detectar el tipo de documento por el nombre de la hoja
        let sheetDocumentType = detectDocumentTypeFromSheetName(sheetName);

        // Si no se pudo detectar por nombre, intentar por las columnas (fallback)
        if (!sheetDocumentType) {
          sheetDocumentType = detectDocumentType(result.headers);
        }

        if (!sheetDocumentType) {
          errors.push(`Hoja "${sheetName}": No se pudo detectar el tipo de documento. Headers: ${result.headers.join(', ')}`);
          continue;
        }

        // Procesar registros de esta hoja y agregarlos al tipo correspondiente
        const processedDocs = processRecords(result.records, result.headers, sheetDocumentType, errors, sheetIndex);
        documentsByType[sheetDocumentType] = documentsByType[sheetDocumentType].concat(processedDocs);
      }
    } else {
      // Procesar como CSV
      const content = buffer.toString('utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');

      if (lines.length === 0) {
        errors.push('El archivo está vacío');
        return { documentsByType, errors };
      }

      // Encontrar la fila donde empiezan los headers
      const headerRowIndex = findHeaderRow(lines);

      // Leer desde la fila de headers
      const csvContent = lines.slice(headerRowIndex).join('\n');

      // Parsear CSV
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        cast: false, // No castear automáticamente, lo haremos manualmente
      });

      if (records.length === 0) {
        errors.push('No se encontraron registros en el archivo');
        return { documentsByType, errors };
      }

      const firstRecord = records[0] as any;
      const headers = Object.keys(firstRecord);

      // Detectar tipo de documento basado en los headers
      const documentType = detectDocumentType(headers);

      if (!documentType) {
        errors.push('No se pudo detectar el tipo de documento. Headers encontrados: ' + headers.join(', '));
        return { documentsByType, errors };
      }

      // Procesar registros del CSV
      const processedDocs = processRecords(records, headers, documentType, errors, 0);
      documentsByType[documentType] = processedDocs;
    }

    return { documentsByType, errors };
  } catch (error: any) {
    errors.push(`Error parseando archivo: ${error.message}`);
    return { documentsByType, errors };
  }
}

/**
 * Procesa registros y los convierte al formato correcto
 */
function processRecords(
  records: any[],
  headers: string[],
  documentType: BillingDocumentType,
  errors: string[],
  sheetOffset: number = 0
): any[] {
  const documents: any[] = [];

  // Campos numéricos
  const numericFields = [
    'rc', 'descuento', 'gravado', 'exonerado', 'inafecto', 'exportacion',
    'gratuito', 'igv', 'isc', 'icbper', 'total', 'detraccion_pen',
    'retencion', 'percepcion_pen'
  ];

  // Campos de fecha
  const dateFields = ['fecha_emision', 'fecha_vencimiento', 'fecha_creacion'];

  // Procesar cada registro
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
        continue; // Saltar registro vacío
      }

      const mappedRecord: any = {};

      // Mapear campos
      for (const key in record) {
        if (!key || String(key).trim() === '') continue; // Saltar keys vacías

        const mappedKey = mapKeyfacilField(key);
        let value = record[key];

        // Normalizar valores
        if (numericFields.includes(mappedKey)) {
          value = normalizeValue(value, true);
        } else if (dateFields.includes(mappedKey)) {
          value = parsePeruvianDate(value);
          // Asegurar que las fechas inválidas sean null, no objetos vacíos
          if (value === null || value === undefined || (typeof value === 'object' && Object.keys(value).length === 0)) {
            value = null;
          }
        } else {
          value = normalizeValue(value, false);
        }

        // Solo agregar campos con valores válidos, excepto campos requeridos que deben estar presentes (aunque sean null)
        if (value !== null && value !== undefined && value !== '') {
          mappedRecord[mappedKey] = value;
        } else if (['serie', 'numero', 'total'].includes(mappedKey)) {
          // Mantener campos requeridos incluso si están vacíos para validación
          mappedRecord[mappedKey] = value !== undefined ? value : null;
        }
      }

      // Validar que tenga campos mínimos (con valores no vacíos)
      const serie = mappedRecord.serie ? String(mappedRecord.serie).trim() : '';
      const numero = mappedRecord.numero ? String(mappedRecord.numero).trim() : '';
      const total = mappedRecord.total !== null && mappedRecord.total !== undefined && mappedRecord.total !== '';

      if (!serie || !numero || !total) {
        const recordNum = sheetOffset > 0 ? `Hoja ${sheetOffset + 1}, registro ${i + 1}` : `Registro ${i + 1}`;
        errors.push(`${recordNum}: Faltan campos requeridos (serie: "${serie}", numero: "${numero}", total: ${mappedRecord.total})`);
        continue;
      }

      documents.push(mappedRecord);
    } catch (error: any) {
      const recordNum = sheetOffset > 0 ? `Hoja ${sheetOffset + 1}, registro ${i + 1}` : `Registro ${i + 1}`;
      errors.push(`Error procesando ${recordNum}: ${error.message}`);
    }
  }

  return documents;
}

