export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const CategorySchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  parent_id: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'categories', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
CategorySchema.index({ tenant_id: 1, name: 1 }, { unique: true });
module.exports = model('Category', CategorySchema);
