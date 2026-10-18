import { describe, expect, it } from "vitest";
import { auditActionLabel, auditEntityLabel, auditScopeLabel } from "@/constants/auditLabels";

describe("etiquetas de auditoría", () => {
  it("traduce la entidad y la acción", () => {
    expect(auditEntityLabel("Warehouse")).toBe("Almacén");
    expect(auditEntityLabel("User")).toBe("Usuario");
    expect(auditActionLabel("login")).toBe("Inicio de sesión");
    expect(auditActionLabel("update")).toBe("Actualización");
  });

  it("describe el ámbito de cada rol", () => {
    expect(auditScopeLabel("platform")).toBe("Solo lectura · Ámbito: todas las empresas");
    expect(auditScopeLabel("tenant", "Molino Norte")).toBe("Solo lectura · Ámbito: Molino Norte");
    expect(auditScopeLabel("own")).toBe("Solo lectura · Ámbito: tus acciones");
  });
});
