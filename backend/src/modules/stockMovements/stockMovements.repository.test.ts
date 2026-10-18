const { beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");

const user = { tenant_id: "t1" };
const movements = [
  { movement_type: "purchase", quantity: 10, created_at: 1 },
  { movement_type: "sale", quantity: 4, created_at: 2 },
  { movement_type: "adjustment_in", quantity: 1, created_at: 3 }
];

mock(require.resolve("../../database/models/User"), {
  findOne: () => ({ exec: async () => user })
});

mock(require.resolve("../../database/models/StockMovement"), {
  find: () => ({
    sort: () => ({ lean: async () => movements })
  })
});

const repository = require("./stockMovements.repository");

describe("kardex", () => {
  beforeEach(() => {
    user.tenant_id = "t1";
  });

  it("calcula el saldo con entradas y salidas en orden", async () => {
    const rows = await repository.findKardex("user-1", "p1");
    assert.deepEqual(rows.map((row: { balance: number }) => row.balance), [10, 6, 7]);
  });

  it("no muestra movimientos de un usuario sin tenant", async () => {
    user.tenant_id = "orphan";
    const rows = await repository.findKardex("user-1", "p1");
    assert.deepEqual(rows, []);
  });
});
