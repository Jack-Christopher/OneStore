export const PRODUCT_TYPE_OPTIONS = [
  { value: "input", label: "Insumo" },
  { value: "finished", label: "Núcleo" },
  { value: "resale", label: "Reventa" },
];

export function productTypeLabel(value?: string | null) {
  return PRODUCT_TYPE_OPTIONS.find((option) => option.value === value)?.label || "Reventa";
}
