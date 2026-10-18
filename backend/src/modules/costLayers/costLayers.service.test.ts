const { beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");

const db = {
  layers: [] as Array<Record<string, any>>,
  product: null as Record<string, any> | null
};

mock(require.resolve("../../database/models/CostLayer"), {
  create: async (doc: Record<string, any>) => {
    const row = {
      ...doc,
      _id: `L${db.layers.length + 1}`,
      async save() {
        return this;
      }
    };
    db.layers.push(row);
    return row;
  },
  find: () => {
    const rows = db.layers
      .filter((layer) => layer.qty_remaining > 0)
      .sort((a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime());
    return {
      sort: () => rows,
      lean: async () => rows
    };
  },
  findById: async (id: string) => db.layers.find((layer) => layer._id === id) || null
});

mock(require.resolve("../../database/models/Product"), {
  findById: () => {
    const pending = Promise.resolve(db.product);
    return Object.assign(pending, { lean: async () => db.product });
  }
});

const { consume, openLayer, refreshAverageCost, restoreAllocations } = require("./costLayers.service");

const layerInput = {
  tenantId: "t1",
  warehouseId: "w1",
  productId: "p1",
  source: "purchase",
  unitCostPen: 10
};

describe("capas FIFO", () => {
  beforeEach(() => {
    db.layers = [];
    db.product = {
      purchase_price: 4,
      sale_price: 9,
      margin_percent: 20,
      saveCalls: 0,
      async save() {
        this.saveCalls += 1;
        return this;
      }
    };
  });

  it("ignora una entrada sin cantidad", async () => {
    const created = await openLayer({ ...layerInput, qty: 0 });
    assert.equal(created, null);
    assert.equal(db.layers.length, 0);
  });

  it("consume primero la capa más antigua y puede restaurarla", async () => {
    await openLayer({ ...layerInput, qty: 2, unitCostPen: 10, receivedAt: new Date("2026-10-01") });
    await openLayer({ ...layerInput, qty: 5, unitCostPen: 20, receivedAt: new Date("2026-10-02") });

    const consumed = await consume({ tenantId: "t1", warehouseId: "w1", productId: "p1", quantity: 3 });

    assert.equal(consumed.uncovered, 0);
    assert.ok(Math.abs(consumed.unitCostPen - (2 * 10 + 20) / 3) < 1e-6);
    assert.deepEqual(db.layers.map((layer) => layer.qty_remaining), [0, 4]);

    await restoreAllocations(consumed.allocations);
    assert.deepEqual(db.layers.map((layer) => layer.qty_remaining), [2, 5]);
  });

  it("completa el costo con el precio del producto si las capas no alcanzan", async () => {
    await openLayer({ ...layerInput, qty: 1, unitCostPen: 8 });
    const consumed = await consume({ tenantId: "t1", warehouseId: "w1", productId: "p1", quantity: 3 });
    assert.equal(consumed.uncovered, 2);
    assert.ok(Math.abs(consumed.unitCostPen - (8 + 4 * 2) / 3) < 1e-6);
  });

  it("recalcula el costo promedio y marca el precio de venta desactualizado", async () => {
    await openLayer({ ...layerInput, qty: 10, unitCostPen: 8 });
    await refreshAverageCost("p1", "t1", "w1");
    assert.equal(db.product?.purchase_price, 8);
    assert.equal(db.product?.last_cost_pen, 8);
    assert.equal(db.product?.price_stale, true);
    assert.equal(db.product?.saveCalls, 1);
  });
});
