export { };
const { Schema, model } = require("mongoose");

const ExchangeRateSchema = new Schema({
  rate_date: { type: String, required: true, unique: true },
  buy: { type: Number, required: true },
  sell: { type: Number, required: true },
  source: { type: String, enum: ["sunat", "exchangerate.fun"], required: true },
  fetched_at: { type: Date, default: () => new Date() }
}, { collection: "exchange_rates", timestamps: false });

module.exports = model("ExchangeRate", ExchangeRateSchema);
