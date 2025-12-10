/**
 * Error handling utility for parsing and formatting API errors
 */

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  originalError?: any;
}

/**
 * Maps entity names to user-friendly Spanish names
 */
const entityNames: Record<string, string> = {
  categories: 'Categoría',
  category: 'Categoría',
  products: 'Producto',
  product: 'Producto',
  warehouses: 'Almacén',
  warehouse: 'Almacén',
  unitsOfMeasure: 'Unidad de Medida',
  unitOfMeasure: 'Unidad de Medida',
  customers: 'Cliente',
  customer: 'Cliente',
  suppliers: 'Proveedor',
  supplier: 'Proveedor',
  productFormulas: 'Fórmula de Producto',
  productFormula: 'Fórmula de Producto',
  tenants: 'Inquilino',
  tenant: 'Inquilino',
  users: 'Usuario',
  user: 'Usuario',
};

/**
 * Maps field names to user-friendly Spanish names
 */
const fieldNames: Record<string, string> = {
  name: 'Nombre',
  sku: 'SKU',
  code: 'Código',
  document: 'Documento',
  email: 'Correo Electrónico',
  tenant_id: 'Inquilino',
  category_id: 'Categoría',
  unit_id: 'Unidad de Medida',
  warehouse_id: 'Almacén',
  product_id: 'Producto',
};

/**
 * Extracts field name from MongoDB duplicate key error
 */
function extractFieldFromError(error: any): string | null {
  if (!error) return null;

  // Check error message for field names
  const errorMessage = error.message || error.toString() || '';
  
  // MongoDB duplicate key error format: "E11000 duplicate key error collection: ... index: field_name_1"
  const indexMatch = errorMessage.match(/index:\s*([^\s_]+)/i);
  if (indexMatch) {
    return indexMatch[1];
  }

  // Check for field in error object
  if (error.keyPattern) {
    const keys = Object.keys(error.keyPattern);
    if (keys.length > 0) {
      // Remove tenant_id from the key if present (it's usually part of compound indexes)
      const field = keys.find(k => k !== 'tenant_id') || keys[0];
      return field.replace(/_id$/, '').replace(/_/g, '_');
    }
  }

  if (error.keyValue) {
    const keys = Object.keys(error.keyValue);
    if (keys.length > 0) {
      const field = keys.find(k => k !== 'tenant_id') || keys[0];
      return field.replace(/_id$/, '').replace(/_/g, '_');
    }
  }

  return null;
}

/**
 * Extracts entity name from API endpoint
 */
function extractEntityFromUrl(url: string): string | null {
  const match = url.match(/\/api\/([^\/]+)/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Parses MongoDB duplicate key error (E11000)
 */
function parseDuplicateKeyError(error: any, url?: string): ApiError {
  const field = extractFieldFromError(error);
  const entity = url ? extractEntityFromUrl(url) : null;
  
  const entityName = entity ? (entityNames[entity] || entity) : 'Registro';
  const fieldName = field ? (fieldNames[field] || field) : 'campo';

  // Special cases for compound unique indexes
  if (field === 'name' && entity) {
    return {
      message: `Ya existe una ${entityName.toLowerCase()} con este ${fieldName.toLowerCase()}. Por favor, utiliza un ${fieldName.toLowerCase()} diferente.`,
      code: 'DUPLICATE_NAME',
      field: field,
    };
  }

  if (field === 'sku') {
    return {
      message: `Ya existe un producto con este SKU. Por favor, utiliza un SKU diferente.`,
      code: 'DUPLICATE_SKU',
      field: field,
    };
  }

  if (field === 'code') {
    return {
      message: `Ya existe una unidad de medida con este código. Por favor, utiliza un código diferente.`,
      code: 'DUPLICATE_CODE',
      field: field,
    };
  }

  if (field === 'document') {
    return {
      message: `Ya existe un cliente con este documento. Por favor, utiliza un documento diferente.`,
      code: 'DUPLICATE_DOCUMENT',
      field: field,
    };
  }

  if (field === 'email') {
    return {
      message: `Ya existe un usuario con este correo electrónico. Por favor, utiliza un correo diferente.`,
      code: 'DUPLICATE_EMAIL',
      field: field,
    };
  }

  // Generic duplicate key error
  return {
    message: `Ya existe un registro con este ${fieldName.toLowerCase()}. Por favor, utiliza un ${fieldName.toLowerCase()} diferente.`,
    code: 'DUPLICATE_KEY',
    field: field || undefined,
  };
}

/**
 * Parses validation errors
 */
function parseValidationError(error: any): ApiError {
  const message = error.message || 'Datos inválidos';
  
  // Check for common validation errors
  if (message.includes('required')) {
    return {
      message: 'Por favor, completa todos los campos requeridos.',
      code: 'VALIDATION_ERROR',
    };
  }

  if (message.includes('invalid') || message.includes('inválid')) {
    return {
      message: 'Los datos proporcionados no son válidos.',
      code: 'VALIDATION_ERROR',
    };
  }

  return {
    message: message,
    code: 'VALIDATION_ERROR',
  };
}

/**
 * Parses network errors
 */
function parseNetworkError(error: any): ApiError {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      message: 'La solicitud tardó demasiado. Por favor, intenta nuevamente.',
      code: 'TIMEOUT_ERROR',
    };
  }

  if (error.message === 'Network Error' || !error.response) {
    return {
      message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.',
      code: 'NETWORK_ERROR',
    };
  }

  return {
    message: 'Error de conexión. Por favor, intenta nuevamente.',
    code: 'NETWORK_ERROR',
  };
}

/**
 * Parses HTTP status errors
 */
function parseHttpError(status: number, data: any): ApiError {
  switch (status) {
    case 400:
      return {
        message: data?.message || 'Solicitud inválida. Por favor, verifica los datos ingresados.',
        code: data?.code || 'BAD_REQUEST',
      };
    case 401:
      return {
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        code: 'UNAUTHORIZED',
      };
    case 403:
      return {
        message: 'No tienes permisos para realizar esta acción.',
        code: 'FORBIDDEN',
      };
    case 404:
      return {
        message: data?.message || 'El recurso solicitado no fue encontrado.',
        code: data?.code || 'NOT_FOUND',
      };
    case 409:
      // Conflict - often used for duplicate keys
      if (data?.code === 'DUPLICATE_KEY' || data?.code === 'DUPLICATE_NAME' || data?.code === 'DUPLICATE_SKU') {
        return {
          message: data?.message || 'Ya existe un registro con estos datos.',
          code: data?.code || 'DUPLICATE_KEY',
        };
      }
      return {
        message: data?.message || 'Conflicto: el recurso ya existe o está en uso.',
        code: data?.code || 'CONFLICT',
      };
    case 422:
      return {
        message: data?.message || 'Los datos proporcionados no son válidos.',
        code: data?.code || 'VALIDATION_ERROR',
      };
    case 500:
      return {
        message: 'Error interno del servidor. Por favor, intenta nuevamente más tarde.',
        code: 'INTERNAL_ERROR',
      };
    case 503:
      return {
        message: 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.',
        code: 'SERVICE_UNAVAILABLE',
      };
    default:
      return {
        message: data?.message || 'Ocurrió un error inesperado.',
        code: data?.code || 'UNKNOWN_ERROR',
      };
  }
}

/**
 * Main function to parse API errors
 */
export function parseApiError(error: any, url?: string): ApiError {
  if (!error) {
    return {
      message: 'Ocurrió un error desconocido.',
      code: 'UNKNOWN_ERROR',
    };
  }

  // Check if it's an axios error
  if (error.response) {
    const { status, data } = error.response;
    const errorData = data || {};

    // Check for MongoDB duplicate key error in the response
    if (errorData.message && typeof errorData.message === 'string') {
      // Check if it's a MongoDB duplicate key error (E11000)
      if (errorData.message.includes('E11000') || 
          errorData.message.includes('duplicate key') ||
          errorData.message.includes('duplicate') ||
          status === 409) {
        
        // Try to parse as duplicate key error
        const duplicateError = parseDuplicateKeyError(errorData, url);
        if (duplicateError) {
          return duplicateError;
        }
      }
    }

    // Check error object for MongoDB duplicate key
    if (errorData.error && (errorData.error.code === 11000 || errorData.error.code === 'E11000')) {
      return parseDuplicateKeyError(errorData.error, url);
    }

    // Parse HTTP status errors
    return parseHttpError(status, errorData);
  }

  // Check if it's a MongoDB error directly
  if (error.code === 11000 || error.code === 'E11000' || error.name === 'MongoServerError') {
    return parseDuplicateKeyError(error, url);
  }

  // Check for validation errors
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return parseValidationError(error);
  }

  // Check for network errors
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
    return parseNetworkError(error);
  }

  // Default error
  return {
    message: error.message || 'Ocurrió un error inesperado.',
    code: error.code || 'UNKNOWN_ERROR',
    originalError: error,
  };
}

/**
 * Gets a user-friendly error message from an error
 */
export function getErrorMessage(error: any, url?: string): string {
  const parsed = parseApiError(error, url);
  return parsed.message;
}

/**
 * Gets error code from an error
 */
export function getErrorCode(error: any, url?: string): string | undefined {
  const parsed = parseApiError(error, url);
  return parsed.code;
}

