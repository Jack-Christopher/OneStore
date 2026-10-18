export { };
const { Schema, model } = require("mongoose");

const CounterSchema = new Schema({
  tenant_id: { type: String, required: true },
  key: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 }
}, { collection: "counters", timestamps: false });

CounterSchema.index({ tenant_id: 1, key: 1 }, { unique: true });

module.exports = model("Counter", CounterSchema);
