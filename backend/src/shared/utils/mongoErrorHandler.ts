/**
 * Utility to handle MongoDB errors and convert them to user-friendly messages
 */

interface MongoError {
  code?: number | string;
  keyPattern?: Record<string, any>;
  keyValue?: Record<string, any>;
  message?: string;
  name?: string;
}

/**
 * Extracts field name from MongoDB duplicate key error
 */
function extractFieldFromMongoError(error: MongoError): string | null {
  if (!error) return null;

  // Check keyPattern (contains the fields in the unique index)
  if (error.keyPattern) {
    const keys = Object.keys(error.keyPattern);
    if (keys.length > 0) {
      // Remove tenant_id from the key if present (it's usually part of compound indexes)
      const field = keys.find(k => k !== 'tenant_id') || keys[0];
      return field;
    }
  }

  // Check keyValue (contains the actual duplicate values)
  if (error.keyValue) {
    const keys = Object.keys(error.keyValue);
    if (keys.length > 0) {
      const field = keys.find(k => k !== 'tenant_id') || keys[0];
      return field;
    }
  }

  return null;
}

/**
 * Maps field names to user-friendly Spanish names
 */
const fieldNames: Record<string, string> = {
  name: 'nombre',
  sku: 'SKU',
  code: 'código',
  document: 'documento',
  email: 'correo electrónico',
};

/**
 * Maps field names to entity-specific messages
 */
function getDuplicateKeyMessage(field: string | null, entityType?: string): string {
  if (!field) {
    return 'Ya existe un registro con estos datos. Por favor, verifica la información.';
  }

  const fieldName = fieldNames[field] || field;

  // Entity-specific messages
  if (entityType) {
    switch (entityType.toLowerCase()) {
      case 'category':
      case 'categories':
        if (field === 'name') {
          return 'Ya existe una categoría con este nombre. Por favor, utiliza un nombre diferente.';
        }
        break;
      case 'product':
      case 'products':
        if (field === 'sku') {
          return 'Ya existe un producto con este SKU. Por favor, utiliza un SKU diferente.';
        }
        if (field === 'name') {
          return 'Ya existe un producto con este nombre. Por favor, utiliza un nombre diferente.';
        }
        break;
      case 'warehouse':
      case 'warehouses':
        if (field === 'name') {
          return 'Ya existe un almacén con este nombre. Por favor, utiliza un nombre diferente.';
        }
        break;
      case 'unitofmeasure':
      case 'units_of_measure':
      case 'unitsOfMeasure':
        if (field === 'code') {
          return 'Ya existe una unidad de medida con este código. Por favor, utiliza un código diferente.';
        }
        break;
      case 'customer':
      case 'customers':
        if (field === 'document') {
          return 'Ya existe un cliente con este documento. Por favor, utiliza un documento diferente.';
        }
        break;
      case 'productformula':
      case 'product_formulas':
      case 'productFormulas':
        if (field === 'name') {
          return 'Ya existe una fórmula de producto con este nombre. Por favor, utiliza un nombre diferente.';
        }
        break;
    }
  }

  // Generic message
  return `Ya existe un registro con este ${fieldName}. Por favor, utiliza un ${fieldName} diferente.`;
}

/**
 * Checks if an error is a MongoDB duplicate key error
 */
export function isDuplicateKeyError(error: any): boolean {
  if (!error) return false;

  // Check error code (MongoDB duplicate key error code is 11000)
  if (error.code === 11000 || error.code === 'E11000' || error.code === '11000') {
    return true;
  }

  // Check error name
  if (error.name === 'MongoServerError' || error.name === 'MongoError') {
    if (error.code === 11000 || error.code === 'E11000') {
      return true;
    }
  }

  // Check message
  if (error.message && typeof error.message === 'string') {
    if (error.message.includes('E11000') || error.message.includes('duplicate key')) {
      return true;
    }
  }

  return false;
}

/**
 * Parses MongoDB duplicate key error and returns user-friendly message
 */
export function parseDuplicateKeyError(error: MongoError, entityType?: string): { message: string; code: string; field?: string } {
  const field = extractFieldFromMongoError(error);
  const message = getDuplicateKeyMessage(field, entityType);

  let code = 'DUPLICATE_KEY';
  if (field === 'name') code = 'DUPLICATE_NAME';
  else if (field === 'sku') code = 'DUPLICATE_SKU';
  else if (field === 'code') code = 'DUPLICATE_CODE';
  else if (field === 'document') code = 'DUPLICATE_DOCUMENT';
  else if (field === 'email') code = 'DUPLICATE_EMAIL';

  return {
    message,
    code,
    field: field || undefined,
  };
}

/**
 * Handles MongoDB errors and converts them to user-friendly format
 */
export function handleMongoError(error: any, entityType?: string): { message: string; code: string; status: number } | null {
  if (!error) return null;

  // Handle duplicate key errors
  if (isDuplicateKeyError(error)) {
    const parsed = parseDuplicateKeyError(error, entityType);
    return {
      ...parsed,
      status: 409, // Conflict
    };
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors || {}).map((err: any) => err.message);
    return {
      message: messages.length > 0 ? messages[0] : 'Datos inválidos',
      code: 'VALIDATION_ERROR',
      status: 400,
    };
  }

  // Handle cast errors (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return {
      message: 'ID inválido',
      code: 'INVALID_ID',
      status: 400,
    };
  }

  return null;
}

