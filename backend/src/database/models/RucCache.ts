export { };
const { Schema, model } = require("mongoose");

const RucCacheSchema = new Schema({
  ruc: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, default: null },
  condition: { type: String, default: null },
  address: { type: String, default: null },
  source: { type: String, required: true },
  fetched_at: { type: Date, default: () => new Date() }
}, { collection: "ruc_cache", timestamps: false });

module.exports = model("RucCache", RucCacheSchema);
