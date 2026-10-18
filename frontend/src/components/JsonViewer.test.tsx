import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import JsonViewer from "@/components/JsonViewer";

describe("JsonViewer", () => {
  it("muestra un aviso cuando no hay datos", () => {
    render(<JsonViewer data={null} />);
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });

  it("pinta claves, textos, números y booleanos", () => {
    render(<JsonViewer data={{ name: "Ana", qty: 2, active: true, note: null }} />);
    expect(screen.getByText("name")).toHaveClass("text-sky-200");
    expect(screen.getByText('"Ana"')).toHaveClass("text-emerald-300");
    expect(screen.getByText("2")).toHaveClass("text-amber-300");
    expect(screen.getByText("true")).toHaveClass("text-sky-300");
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("colapsa objetos anidados y los abre al hacer clic", async () => {
    const user = userEvent.setup();
    render(<JsonViewer data={{ user: { id: "1" } }} />);
    expect(screen.getByText("Objeto(1)")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /user/ }));
    expect(screen.getByText('"1"')).toBeInTheDocument();
  });

  it("reconstruye un ObjectId guardado como índices numéricos", () => {
    const hex = "6acae1d058d210c59d411010";
    const broken = Object.fromEntries([...hex].map((char, index) => [index, char]));
    render(<JsonViewer data={{ _id: broken }} />);
    expect(screen.getByText(`"${hex}"`)).toBeInTheDocument();
  });

  it("marca una referencia circular", () => {
    const row: Record<string, unknown> = { name: "A" };
    row.self = row;
    render(<JsonViewer data={row} />);
    expect(screen.getByText('"[Circular]"')).toBeInTheDocument();
  });
});
