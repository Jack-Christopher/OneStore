export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const SaleNoteSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  serie: { type: String, required: true },
  numero: { type: String, required: true },
  sucursal: { type: String },
  cliente_doc: { type: String },
  cliente_nombre: { type: String },
  fecha_emision: { type: Date },
  fecha_vencimiento: { type: Date },
  fecha_creacion: { type: Date },
  usuario: { type: String },
  placa_vehiculo: { type: String },
  orden_compra: { type: String },
  guias_remision: { type: String },
  cond_pago: { type: String },
  met_pago: { type: String },
  referencia: { type: String },
  cuotas: { type: String },
  observaciones: { type: String },
  otros: { type: String },
  moneda: { type: String },
  rc: { type: Number, default: 0 },
  descuento: { type: Number, default: 0 },
  gravado: { type: Number, default: 0 },
  exonerado: { type: Number, default: 0 },
  inafecto: { type: Number, default: 0 },
  exportacion: { type: Number, default: 0 },
  gratuito: { type: Number, default: 0 },
  igv: { type: Number, default: 0 },
  isc: { type: Number, default: 0 },
  icbper: { type: Number, default: 0 },
  total: { type: Number, required: true },
  anulado: { type: String },
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'sale_notes', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

SaleNoteSchema.index({ tenant_id: 1, serie: 1, numero: 1 }, { unique: true });
module.exports = model('SaleNote', SaleNoteSchema);

