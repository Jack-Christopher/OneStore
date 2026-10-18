import type { Dispatch, FocusEvent, SetStateAction } from "react";
import { describe, expect, it } from "vitest";
import { createTrimmedBlurHandler, trimString, trimStringValues } from "@/utils/formUtils";

describe("formularios", () => {
  it("recorta textos anidados y listas", () => {
    expect(trimString("  hola  ")).toBe("hola");
    expect(trimString(null)).toBe("");
    expect(trimStringValues({
      name: "  Ana ",
      items: [{ sku: " INS-1 " }],
      issuedAt: new Date("2026-10-10T00:00:00.000Z")
    }).name).toBe("Ana");
    expect(trimStringValues({ items: [{ sku: " INS-1 " }] }).items[0].sku).toBe("INS-1");
  });

  it("recorta el campo al salir del input", () => {
    let form = { name: "  Ana " };
    const setForm: Dispatch<SetStateAction<typeof form>> = (update) => {
      form = typeof update === "function" ? update(form) : update;
    };
    const onBlur = createTrimmedBlurHandler(setForm, "name");
    onBlur({ target: { value: "  Ana " } } as FocusEvent<HTMLInputElement>);
    expect(form.name).toBe("Ana");
  });
});
