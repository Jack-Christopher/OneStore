const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { toSnakeCase } = require("./object");

describe("toSnakeCase", () => {
  it("convierte claves anidadas y descarta el id del cliente", () => {
    assert.deepEqual(toSnakeCase({
      id: "uuid",
      purchaseUnitId: "u1",
      items: [{ unitCostBase: 4, id: "row" }],
      issuedAt: null
    }), {
      purchase_unit_id: "u1",
      items: [{ unit_cost_base: 4 }],
      issued_at: null
    });
  });
});
