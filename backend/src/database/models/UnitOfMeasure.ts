export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const UnitSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'units_of_measure', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
UnitSchema.index({ tenant_id: 1, code: 1 }, { unique: true });
module.exports = model('UnitOfMeasure', UnitSchema);
