const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  port: process.env.PORT || 4000,
  dbUrl: process.env.MONGO_URI || "mongodb://localhost:27017/onestore",
  jwtSecret: process.env.JWT_SECRET || "default_secret",
  sunatExchangeUrl: process.env.SUNAT_EXCHANGE_URL || "https://www.sunat.gob.pe/a/txt/tipoCambio.txt",
  exchangeFallbackUrl: process.env.EXCHANGE_FALLBACK_URL || "https://api.exchangerate.fun/latest?base=USD",
  decolectaApiToken: process.env.DECOLECTA_API_TOKEN || "",
  decolectaApiUrl: process.env.DECOLECTA_API_URL || "https://api.decolecta.com/v1/sunat/ruc",
  openRucApiUrl: process.env.OPENRUC_API_URL || "https://dniruc.apis.net.pe/api/v1/ruc"
};