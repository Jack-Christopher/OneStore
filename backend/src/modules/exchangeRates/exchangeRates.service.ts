export { };
const axios = require("axios");
const ExchangeRate = require("../../database/models/ExchangeRate");
const env = require("../../config/env");
const { parseSunatTxt, parseFallbackRate, toDateKey } = require("../costLayers/costing");

const HTTP_TIMEOUT = 8000;

async function fetchSunat() {
  const response = await axios.get(env.sunatExchangeUrl, {
    timeout: HTTP_TIMEOUT,
    responseType: "text",
    headers: { "User-Agent": "OneStore/1.0" }
  });
  const parsed = parseSunatTxt(response.data);
  if (!parsed) {
    throw new Error("SUNAT no devolvió un tipo de cambio reconocible");
  }
  return { ...parsed, source: "sunat" };
}

async function fetchFallback(date: string) {
  const response = await axios.get(env.exchangeFallbackUrl, {
    timeout: HTTP_TIMEOUT,
    headers: { "User-Agent": "OneStore/1.0" }
  });
  const parsed = parseFallbackRate(response.data);
  if (!parsed) {
    throw new Error("El tipo de cambio de respaldo no incluye PEN");
  }
  return { date, ...parsed, source: "exchangerate.fun" };
}

async function saveRate(rate: { date: string; buy: number; sell: number; source: string }) {
  return ExchangeRate.findOneAndUpdate(
    { rate_date: rate.date },
    {
      rate_date: rate.date,
      buy: rate.buy,
      sell: rate.sell,
      source: rate.source,
      fetched_at: new Date()
    },
    { upsert: true, new: true }
  ).lean();
}

async function syncLatest() {
  const today = toDateKey(new Date());
  try {
    const sunat = await fetchSunat();
    return saveRate(sunat);
  } catch (sunatError: any) {
    console.error("SUNAT exchange rate failed:", sunatError.message);
    try {
      const fallback = await fetchFallback(today);
      return saveRate(fallback);
    } catch (fallbackError: any) {
      const stored = await ExchangeRate.findOne().sort({ rate_date: -1 }).lean();
      if (stored) return stored;
      throw new Error(`No se pudo obtener el tipo de cambio: ${fallbackError.message}`);
    }
  }
}

async function getForDate(value: Date) {
  const key = toDateKey(value);
  const exact = await ExchangeRate.findOne({ rate_date: key }).lean();
  if (exact) return exact;

  if (key === toDateKey(new Date())) {
    return syncLatest();
  }

  const previous = await ExchangeRate.findOne({ rate_date: { $lte: key } }).sort({ rate_date: -1 }).lean();
  if (previous) return previous;

  return syncLatest();
}

async function getLatest() {
  const stored = await ExchangeRate.findOne().sort({ rate_date: -1 }).lean();
  if (stored) return stored;
  return syncLatest();
}

function quoteForBase(baseCurrency: string, rate: { buy: number; sell: number; rate_date: string; source: string }) {
  const base = (baseCurrency || "PEN").toUpperCase();
  const rates: Record<string, number> = {};
  if (base === "PEN") {
    rates.pen = 1;
    rates.usd = rate.sell > 0 ? Number((1 / rate.sell).toFixed(6)) : 0;
  } else if (base === "USD") {
    rates.usd = 1;
    rates.pen = rate.sell;
  } else {
    rates[base.toLowerCase()] = 1;
    rates.usd = rate.sell > 0 ? Number((1 / rate.sell).toFixed(6)) : 0;
    rates.pen = rate.sell;
  }

  return {
    rates,
    sunat: {
      buy: rate.buy,
      sell: rate.sell,
      date: rate.rate_date,
      source: rate.source
    }
  };
}

module.exports = {
  syncLatest,
  getForDate,
  getLatest,
  quoteForBase
};
