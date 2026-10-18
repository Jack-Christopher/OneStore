import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/utils/currency";

describe("formatCurrency", () => {
  it("usa soles y separador de miles cuando no hay moneda", () => {
    expect(formatCurrency(1234.5)).toBe("S/.1,234.50");
  });

  it("respeta el signo y el símbolo pedido", () => {
    expect(formatCurrency(-10, "USD")).toBe("-$10.00");
    expect(formatCurrency(null, "EUR")).toBe("€0.00");
  });
});
