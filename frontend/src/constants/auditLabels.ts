export const AUDIT_ACTIONS = [
  { value: "create", label: "Creación" },
  { value: "update", label: "Actualización" },
  { value: "delete", label: "Eliminación" },
  { value: "login", label: "Inicio de sesión" },
  { value: "logout", label: "Cierre de sesión" },
];

export const AUDIT_ENTITIES = [
  { value: "Product", label: "Producto" },
  { value: "Sale", label: "Venta" },
  { value: "StockMovement", label: "Movimiento de stock" },
  { value: "PurchaseOrder", label: "Compra" },
  { value: "Supplier", label: "Proveedor" },
  { value: "Category", label: "Categoría" },
  { value: "Warehouse", label: "Almacén" },
  { value: "Tenant", label: "Empresa" },
  { value: "User", label: "Usuario" },
  { value: "Customer", label: "Cliente" },
  { value: "ProductFormula", label: "Fórmula" },
  { value: "UnitOfMeasure", label: "Unidad de medida" },
];

export function auditActionLabel(value?: string | null) {
  return AUDIT_ACTIONS.find((action) => action.value === value)?.label || "Otra acción";
}

export function auditEntityLabel(value?: string | null) {
  return AUDIT_ENTITIES.find((entity) => entity.value === value)?.label || "Otro registro";
}

export function auditScopeLabel(scope?: string | null, tenantName?: string | null) {
  if (scope === "platform") return "Solo lectura · Ámbito: todas las empresas";
  if (scope === "tenant") return `Solo lectura · Ámbito: ${tenantName || "tu empresa"}`;
  if (scope === "own") return "Solo lectura · Ámbito: tus acciones";
  return "Solo lectura";
}
