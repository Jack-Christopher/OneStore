const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");

const calls: unknown[] = [];
const month = new Date();
const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

const model = {
  aggregate: async (pipeline: unknown) => {
    calls.push(pipeline);
    return [{ _id: key, count: 3, total: 150 }];
  }
};

mock(require.resolve("../../database/models/Invoice"), model);
mock(require.resolve("../../database/models/SaleTicket"), model);
mock(require.resolve("../../database/models/CreditNote"), model);
mock(require.resolve("../../database/models/DebitNote"), model);

const { getDocumentSummary } = require("./billingSummary.service");

describe("resumen por tipo de comprobante", () => {
  it("agrupa el mes actual y excluye anulados en la consulta", async () => {
    const summary = await getDocumentSummary("t1");

    assert.equal(summary.months.length, 6);
    assert.equal(summary.months.at(-1), key);
    assert.deepEqual(summary.types.map((row: { label: string }) => row.label), [
      "Factura",
      "Boleta",
      "Nota de crédito",
      "Nota de débito"
    ]);
    assert.equal(summary.types[0].count, 3);
    assert.equal(summary.types[0].total, 150);
    assert.match(JSON.stringify(calls[0]), /anulado/);
  });
});
