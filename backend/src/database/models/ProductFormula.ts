export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const FormulaItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  unit_id: { type: Schema.Types.ObjectId, ref: "UnitOfMeasure", required: true }, 
  quantity: { type: Number, required: true }
});

const ProductFormulaSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  items: { type: [FormulaItemSchema], required: true },
  reference_quantity: { type: Number, required: true },
  reference_unit_id: { type: Schema.Types.ObjectId, ref: "UnitOfMeasure", required: true },
  is_active: { type: Boolean, default: true },
  created_by: { String },
  updated_by: { String }
}, { collection: "product_formulas", timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

ProductFormulaSchema.index({ tenant_id: 1, name: 1 }, { unique: true });
module.exports = model('ProductFormula', ProductFormulaSchema);

