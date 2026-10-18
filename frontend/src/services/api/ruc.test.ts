import { describe, expect, it } from "vitest";
import { rucErrorMessage } from "@/services/api/ruc";

describe("mensaje de consulta RUC", () => {
  it("oculta el fallo técnico del proveedor", () => {
    expect(rucErrorMessage({
      userMessage: "OpenRUC: getaddrinfo ENOTFOUND dniruc.apis.net.pe"
    })).toBe("No se pudo consultar el RUC. El servicio de consulta no está disponible en este momento.");
  });

  it("conserva el aviso cuando el número no tiene 11 dígitos", () => {
    expect(rucErrorMessage({ userMessage: "El RUC debe tener 11 dígitos" })).toBe("El RUC debe tener 11 dígitos.");
  });
});
