import { describe, expect, it } from "vitest";
import { PRODUCT_TYPE_OPTIONS, productTypeLabel } from "@/constants/productTypes";

describe("tipos de producto", () => {
  it("ofrece insumo, núcleo y reventa", () => {
    expect(PRODUCT_TYPE_OPTIONS.map((option) => option.value)).toEqual(["input", "finished", "resale"]);
    expect(productTypeLabel("finished")).toBe("Núcleo");
    expect(productTypeLabel("desconocido")).toBe("Reventa");
  });
});
