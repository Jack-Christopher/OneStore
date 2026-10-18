const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");

mock(require.resolve("../../database/models/User"), {
  findById: () => ({ lean: async () => ({ tenant_id: "t1" }) })
});

mock(require.resolve("../../database/models/PurchaseOrder"), {
  find: () => ({
    lean: async () => [{
      _id: "po1",
      supplier_id: "s1",
      reference_number: "F001-12",
      issued_at: new Date(2026, 9, 1),
      paid_at: new Date(2026, 9, 2),
      currency_code: "USD",
      sunat_sell: 3.7,
      freight_amount: 10,
      freight_mode: "per_bag"
    }]
  })
});

mock(require.resolve("../../database/models/PurchaseOrderItem"), {
  find: () => ({
    lean: async () => [{
      purchase_order_id: "po1",
      product_id: "p1",
      quantity: 2,
      unit_cost_original: 5,
      unit_cost_base: 18.5
    }]
  })
});

mock(require.resolve("../../database/models/Product"), {
  find: () => ({
    lean: async () => [{
      _id: "p1",
      name: "Azúcar",
      unit_id: "u1",
      purchase_to_stock_factor: 25,
      margin_percent: 30,
      sale_price: 1.2
    }]
  })
});

mock(require.resolve("../../database/models/Supplier"), {
  find: () => ({ lean: async () => [{ _id: "s1", name: "Molino Norte" }] })
});

mock(require.resolve("../../database/models/UnitOfMeasure"), {
  find: () => ({ lean: async () => [{ _id: "u1", name: "Saco" }] })
});

const { buildCostSheetCsv } = require("./costSheet");

describe("hoja de costos", () => {
  it("exporta precio en dólares, tipo SUNAT y costo por unidad de stock", async () => {
    const file = await buildCostSheetCsv("user-1");
    assert.equal(file.filename, "costos.csv");
    assert.equal(file.content.charCodeAt(0), 0xfeff);
    assert.match(file.content, /Proveedor,Producto,Factura/);
    assert.match(file.content, /Molino Norte,Azúcar,F001-12/);
    assert.match(file.content, /5,18\.5,25,10,per_bag,3\.7,30,1\.2,0\.74/);
  });
});
