import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const http = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/services/lib/axios", () => ({
  default: { get: http.get }
}));

import DocumentTypeSummary from "@/pages/Stats/components/DocumentTypeSummary";

const summary = {
  months: ["2026-10"],
  types: [{
    type: "invoice",
    label: "Factura",
    count: 2,
    total: 100,
    months: [{ month: "2026-10", count: 2, total: 100 }]
  }]
};

describe("resumen de comprobantes", () => {
  beforeEach(() => {
    http.get.mockReset();
  });

  it("no muestra la tabla si la consulta no trae datos", async () => {
    http.get.mockResolvedValue({ data: { success: false } });
    const { container } = render(<DocumentTypeSummary />);
    await vi.waitFor(() => expect(http.get).toHaveBeenCalledWith("/api/stats/billing/document-summary"));
    expect(container).toBeEmptyDOMElement();
  });

  it("lista facturas y su total del mes", async () => {
    http.get.mockResolvedValue({ data: { success: true, data: summary } });
    render(<DocumentTypeSummary />);
    expect(await screen.findByText("Factura")).toBeInTheDocument();
    expect(screen.getAllByText((_, element) => element?.textContent === "2 · S/.100.00").length).toBe(2);
    expect(screen.getByText("2026-10")).toBeInTheDocument();
  });
});
