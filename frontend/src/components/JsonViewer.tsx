import { useState } from "react";

function normalize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (!Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    const indexed = keys.length > 0 && keys.every((key, index) => key === String(index));
    if (indexed) {
      const text = keys.map((key) => String(record[key] ?? "")).join("");
      if (/^[0-9a-fA-F]{24}$/.test(text) || /^\d{4}-\d{2}-\d{2}T/.test(text)) return text;
    }
  }

  if (Array.isArray(value)) return value.map((item) => normalize(item, seen));

  const output: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    output[key] = normalize((value as Record<string, unknown>)[key], seen);
  }
  return output;
}

function preview(value: unknown) {
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (value && typeof value === "object") return `Objeto(${Object.keys(value).length})`;
  return "";
}

function Value({ value }: { value: unknown }) {
  if (value === null) return <span className="text-muted-foreground">null</span>;
  if (typeof value === "string") return <span className="text-emerald-300">"{value}"</span>;
  if (typeof value === "number") return <span className="text-amber-300">{value}</span>;
  if (typeof value === "boolean") return <span className="text-sky-300">{String(value)}</span>;
  return <span>{String(value)}</span>;
}

function Node({ label, value, depth }: { label?: string; value: unknown; depth: number }) {
  const complex = value !== null && typeof value === "object";
  const [open, setOpen] = useState(depth < 1);
  const entries = complex
    ? Object.entries(value as Record<string, unknown>)
    : [];

  if (!complex) {
    return (
      <div className="leading-6">
        {label && <span className="text-sky-200">{label}</span>}
        {label && <span className="text-muted-foreground">: </span>}
        <Value value={value} />
      </div>
    );
  }

  return (
    <div className="leading-6">
      <button type="button" className="text-left" onClick={() => setOpen((current) => !current)}>
        <span className="mr-1 inline-block w-3 text-muted-foreground">{open ? "▾" : "▸"}</span>
        {label && <span className="text-sky-200">{label}</span>}
        {label && <span className="text-muted-foreground">: </span>}
        {!open && <span className="text-muted-foreground">{preview(value)}</span>}
      </button>
      {open && (
        <div className="ml-4 border-l border-border pl-3">
          {entries.length === 0 && <span className="text-muted-foreground">{Array.isArray(value) ? "[]" : "{}"}</span>}
          {entries.map(([key, child]) => (
            <Node key={key} label={Array.isArray(value) ? `[${key}]` : key} value={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JsonViewer({ data, emptyLabel = "Sin datos" }: { data: unknown; emptyLabel?: string }) {
  if (data === null || data === undefined) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="max-h-96 overflow-auto border border-border bg-background p-3 text-sm text-foreground">
      <Node value={normalize(data)} depth={0} />
    </div>
  );
}
