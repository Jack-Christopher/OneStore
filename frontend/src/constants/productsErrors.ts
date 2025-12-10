export const ProductsErrorMessages: Record<string, string> = {
  PRODUCT_NOT_FOUND: "Producto no encontrado.",
  INVALID_PRODUCT_DATA: "Datos de producto inválidos.",
  PRODUCT_CREATION_FAILED: "Error al crear el producto.",
  PRODUCT_UPDATE_FAILED: "Error al actualizar el producto.",
  PRODUCT_DELETION_FAILED: "Error al eliminar el producto.",
  DUPLICATE_SKU: "Ya existe un producto con este SKU. Por favor, utiliza un SKU diferente.",
  DUPLICATE_KEY: "Ya existe un producto con estos datos. Por favor, verifica la información.",
  CREATE_ERROR: "No se pudo crear el producto. Verifica que el SKU no esté duplicado.",
  UPDATE_ERROR: "No se pudo actualizar el producto. Verifica que el SKU no esté duplicado.",
  DELETE_ERROR: "No se pudo eliminar el producto.",
  NOT_FOUND: "Producto no encontrado.",
  INTERNAL_ERROR: "Error interno del servidor. Por favor, intenta nuevamente.",
}