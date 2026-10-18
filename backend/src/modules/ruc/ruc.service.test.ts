const { beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mock = require("mock-require");

const cache = { record: null as Record<string, unknown> | null };
const http = { get: async (_url: string) => ({ data: {} }) };

mock("axios", {
  get: (url: string) => http.get(url)
});

mock(require.resolve("../../database/models/RucCache"), {
  findOne: () => ({ lean: async () => cache.record }),
  findOneAndUpdate: (_query: unknown, update: Record<string, unknown>) => ({
    lean: async () => update
  })
});

const { lookup } = require("./ruc.service");

describe("consulta RUC", () => {
  beforeEach(() => {
    cache.record = null;
    http.get = async () => {
      throw new Error("no disponible");
    };
  });

  it("rechaza un número que no tiene 11 dígitos", async () => {
    await assert.rejects(() => lookup("123"), (error: any) => {
      assert.equal(error.status, 400);
      return true;
    });
  });

  it("responde desde la caché sin llamar al proveedor", async () => {
    cache.record = { ruc: "20100070970", name: "ACME SAC", source: "cache" };
    let called = false;
    http.get = async () => {
      called = true;
      return { data: {} };
    };
    const result = await lookup("20100070970");
    assert.equal(result.name, "ACME SAC");
    assert.equal(called, false);
  });

  it("normaliza la razón social de OpenRUC", async () => {
    http.get = async () => ({
      data: { razonSocial: "  Molino Norte  ", estado: "ACTIVO", direccion: "Lima" }
    });
    const result = await lookup("20-100070970");
    assert.equal(result.ruc, "20100070970");
    assert.equal(result.name, "Molino Norte");
    assert.equal(result.status, "ACTIVO");
    assert.equal(result.source, "openruc");
  });

  it("explica cuando el servicio de consulta no responde", async () => {
    http.get = async () => {
      throw new Error("getaddrinfo ENOTFOUND dniruc.apis.net.pe");
    };
    await assert.rejects(() => lookup("20100070970"), (error: any) => {
      assert.equal(error.status, 503);
      assert.equal(error.message.includes("ENOTFOUND"), false);
      assert.equal(error.message.includes("dniruc"), false);
      assert.match(error.message, /no está disponible/);
      return true;
    });
  });

  it("explica cuando el RUC no existe", async () => {
    http.get = async () => {
      const error: any = new Error("not found");
      error.response = { status: 404 };
      throw error;
    };
    await assert.rejects(() => lookup("20100070970"), (error: any) => {
      assert.equal(error.status, 404);
      assert.equal(error.message, "No encontramos una empresa con ese RUC.");
      return true;
    });
  });
});
