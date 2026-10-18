export { };
const axios = require("axios");
const RucCache = require("../../database/models/RucCache");
const env = require("../../config/env");

const HTTP_TIMEOUT = 8000;

function onlyDigits(value: string) {
  return String(value || "").replace(/\D/g, "");
}

function normalize(raw: any, source: string, ruc: string) {
  const data = raw?.data && typeof raw.data === "object" ? raw.data : raw;
  const name = data?.razon_social || data?.razonSocial || data?.nombre || data?.name;
  if (!name) return null;
  return {
    ruc: String(data?.ruc || data?.numeroDocumento || data?.numero_documento || ruc),
    name: String(name).trim(),
    status: data?.estado || data?.status || null,
    condition: data?.condicion || data?.condition || null,
    address: data?.direccion || data?.direccion_completa || data?.address || null,
    source
  };
}

async function fromCache(ruc: string) {
  return RucCache.findOne({ ruc }).lean();
}

async function remember(record: any) {
  return RucCache.findOneAndUpdate(
    { ruc: record.ruc },
    { ...record, fetched_at: new Date() },
    { upsert: true, new: true }
  ).lean();
}

async function lookupDecolecta(ruc: string) {
  if (!env.decolectaApiToken) return null;
  const response = await axios.get(`${env.decolectaApiUrl}/${ruc}`, {
    timeout: HTTP_TIMEOUT,
    headers: {
      Authorization: `Bearer ${env.decolectaApiToken}`,
      "User-Agent": "OneStore/1.0"
    }
  });
  return normalize(response.data, "decolecta", ruc);
}

async function lookupOpenRuc(ruc: string) {
  const response = await axios.get(`${env.openRucApiUrl}/${ruc}`, {
    timeout: HTTP_TIMEOUT,
    headers: { "User-Agent": "OneStore/1.0" }
  });
  return normalize(response.data, "openruc", ruc);
}

function failureKind(error: any) {
  const status = error?.response?.status;
  if (status === 404 || status === 422) return "missing";
  return "unavailable";
}

function failLookup(kind: "missing" | "unavailable") {
  const error: any = new Error(
    kind === "missing"
      ? "No encontramos una empresa con ese RUC."
      : "No se pudo consultar el RUC. El servicio de consulta no está disponible en este momento."
  );
  error.status = kind === "missing" ? 404 : 503;
  return error;
}

async function lookup(rucInput: string) {
  const ruc = onlyDigits(rucInput);
  if (ruc.length !== 11) {
    const error: any = new Error("El RUC debe tener 11 dígitos");
    error.status = 400;
    throw error;
  }

  const cached = await fromCache(ruc);
  if (cached) return cached;

  let record = null;
  let sawMissing = false;
  let sawUnavailable = false;

  if (env.decolectaApiToken) {
    try {
      record = await lookupDecolecta(ruc);
    } catch (error: any) {
      if (failureKind(error) === "missing") sawMissing = true;
      else sawUnavailable = true;
    }
  }

  if (!record) {
    try {
      record = await lookupOpenRuc(ruc);
      if (!record) sawMissing = true;
    } catch (error: any) {
      if (failureKind(error) === "missing") sawMissing = true;
      else sawUnavailable = true;
    }
  }

  if (!record) {
    throw failLookup(sawUnavailable && !sawMissing ? "unavailable" : "missing");
  }

  return remember(record);
}

module.exports = { lookup };
