const { beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");

const counter = { seq: 0 };

mock(require.resolve("../../database/models/Counter"), {
  findOneAndUpdate: async () => {
    counter.seq += 1;
    return { seq: counter.seq };
  }
});

const { nextSku } = require("./sku");

describe("SKU automático", () => {
  beforeEach(() => {
    counter.seq = 0;
  });

  it("numera por tipo de producto", async () => {
    assert.equal(await nextSku("t1", "input"), "INS-000001");
    assert.equal(await nextSku("t1", "finished"), "NUC-000002");
    assert.equal(await nextSku("t1"), "REV-000003");
  });
});
