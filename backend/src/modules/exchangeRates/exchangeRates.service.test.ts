const { beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");

const stored = { rows: [] as Array<Record<string, any>> };

mock(require.resolve("../../database/models/ExchangeRate"), {
  findOne(query: { rate_date?: string | { $lte?: string } }) {
    const chain = {
      sort() {
        return chain;
      },
      async lean() {
        const filter = query.rate_date;
        if (filter && typeof filter === "object" && filter.$lte) {
          const sorted = stored.rows
            .filter((row) => String(row.rate_date) <= String(filter.$lte))
            .sort((a, b) => String(a.rate_date).localeCompare(String(b.rate_date)));
          return sorted[sorted.length - 1] || null;
        }
        return stored.rows.find((row) => row.rate_date === filter) || null;
      }
    };
    return chain;
  }
});

const { getForDate, quoteForBase } = require("./exchangeRates.service");

const sunat = {
  rate_date: "2026-09-08",
  buy: 3.68,
  sell: 3.7,
  source: "sunat"
};

describe("cotización para la moneda base", () => {
  it("guarda el factor extranjero por base y el tipo SUNAT por separado", () => {
    const quote = quoteForBase("PEN", sunat);
    assert.equal(quote.rates.pen, 1);
    assert.ok(Math.abs(quote.rates.usd - 1 / 3.7) < 1e-6);
    assert.equal(quote.sunat.sell, 3.7);
    assert.equal(quote.sunat.date, "2026-09-08");
    assert.equal(quote.sunat.source, "sunat");
  });

  it("invierte la cotización cuando la base es dólar", () => {
    const quote = quoteForBase("USD", sunat);
    assert.equal(quote.rates.usd, 1);
    assert.equal(quote.rates.pen, 3.7);
  });
});

describe("tipo de cambio por fecha", () => {
  beforeEach(() => {
    stored.rows = [
      { rate_date: "2026-09-01", buy: 3.6, sell: 3.65, source: "sunat" },
      sunat
    ];
  });

  it("devuelve la tasa exacta del día", async () => {
    const rate = await getForDate(new Date(2026, 8, 8));
    assert.equal(rate.rate_date, "2026-09-08");
  });

  it("usa la última tasa anterior si ese día no está guardado", async () => {
    const rate = await getForDate(new Date(2026, 8, 10));
    assert.equal(rate.rate_date, "2026-09-08");
  });
});
