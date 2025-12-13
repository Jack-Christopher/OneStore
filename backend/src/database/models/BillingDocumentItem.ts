export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const BillingDocumentItemSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  document_type: { 
    type: String, 
    required: true, 
    enum: ['invoice', 'sale_ticket', 'credit_note', 'debit_note', 'sale_note', 'proforma'],
    index: true
  },
  document_id: { type: String, required: true, index: true },
  producto_nombre: { type: String },
  producto_codigo: { type: String },
  cantidad: { type: Number, default: 0 },
  precio_unitario: { type: Number, default: 0 },
  descuento: { type: Number, default: 0 },
  gravado: { type: Number, default: 0 },
  exonerado: { type: Number, default: 0 },
  inafecto: { type: Number, default: 0 },
  exportacion: { type: Number, default: 0 },
  gratuito: { type: Number, default: 0 },
  igv: { type: Number, default: 0 },
  isc: { type: Number, default: 0 },
  icbper: { type: Number, default: 0 },
  total_linea: { type: Number, default: 0 },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'billing_document_items', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

BillingDocumentItemSchema.index({ tenant_id: 1, document_type: 1, document_id: 1 });
module.exports = model('BillingDocumentItem', BillingDocumentItemSchema);

