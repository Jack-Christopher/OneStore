const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  COST_ALERT_PERCENT,
  isPriceStale,
  parseFallbackRate,
  parseSunatTxt,
  receiptCost,
  skuPrefix,
  stockFactor,
  stockQuantity,
  toDateKey
} = require("./costing");

function close(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} !~ ${expected}`);
}

describe("sku y unidades", () => {
  it("asigna prefijo según el tipo de producto", () => {
    assert.equal(skuPrefix("input"), "INS");
    assert.equal(skuPrefix("finished"), "NUC");
    assert.equal(skuPrefix("resale"), "REV");
    assert.equal(skuPrefix(undefined), "REV");
  });

  it("convierte la cantidad comprada a unidad de stock", () => {
    assert.equal(stockFactor(0), 1);
    assert.equal(stockFactor(null), 1);
    assert.equal(stockQuantity(4, 25), 100);
    assert.equal(stockQuantity(4, null), 4);
  });
});

describe("costo de recepción", () => {
  const base = {
    penPerDocumentUnit: 3.7,
    quantity: 2,
    stockFactor: 25,
    unitCostBase: 92.5,
    lineValueDoc: 50,
    totalValueDoc: 100
  };

  it("reparte el precio de la unidad de compra entre las unidades de stock", () => {
    const cost = receiptCost({ ...base, mode: "none", freightAmount: 0 });
    assert.equal(cost.stockQty, 50);
    close(cost.unitCostPen, 3.7);
    assert.equal(cost.freightPen, 0);
  });

  it("suma el flete por saco al costo de cada unidad de stock", () => {
    const cost = receiptCost({ ...base, mode: "per_bag", freightAmount: 10 });
    close(cost.unitCostPen, 3.7 + (10 * 3.7) / 25);
    close(cost.freightPen, 10 * 3.7 * 2);
  });

  it("prorratea el flete según el valor de la línea", () => {
    const cost = receiptCost({ ...base, mode: "prorated", freightAmount: 20 });
    const lineFreight = 20 * 3.7 * 0.5;
    close(cost.freightPen, lineFreight);
    close(cost.unitCostPen, 3.7 + lineFreight / 50);
  });

  it("no divide entre cero cuando la cantidad es inválida", () => {
    const cost = receiptCost({ ...base, mode: "prorated", freightAmount: 20, quantity: 0 });
    assert.equal(cost.stockQty, 0);
    assert.equal(cost.unitCostPen, 0);
  });
});

describe("alerta de precio", () => {
  it("marca el precio desactualizado si el costo sube 5% y la venta queda bajo el margen", () => {
    assert.equal(COST_ALERT_PERCENT, 5);
    assert.equal(isPriceStale(10, 10.5, 11, 20), true);
    assert.equal(isPriceStale(10, 10.4, 11, 20), false);
    assert.equal(isPriceStale(10, 12, 15, 20), false);
    assert.equal(isPriceStale(0, 12, 11, 20), false);
  });
});

describe("tipo de cambio", () => {
  it("lee la fecha y los tipos del archivo de SUNAT", () => {
    assert.deepEqual(parseSunatTxt("10/10/2026|3.680|3.702\n"), {
      date: "2026-10-10",
      buy: 3.68,
      sell: 3.702
    });
    assert.equal(parseSunatTxt("sin datos"), null);
    assert.equal(parseSunatTxt("10/10/2026|0|3.7"), null);
  });

  it("usa el sol del tipo de cambio de respaldo para compra y venta", () => {
    assert.deepEqual(parseFallbackRate({ rates: { PEN: 3.71 } }), { buy: 3.71, sell: 3.71 });
    assert.deepEqual(parseFallbackRate({ rates: { pen: 3.5 } }), { buy: 3.5, sell: 3.5 });
    assert.equal(parseFallbackRate({ rates: {} }), null);
  });

  it("formatea la fecha local del servidor", () => {
    assert.equal(toDateKey(new Date(2026, 9, 10)), "2026-10-10");
  });
});
