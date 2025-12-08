export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  tenant_id: { type: String, required: true, index: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  full_name: { type: String },
  role: { type: String, enum: ['admin', 'manager', 'clerk'], default: 'clerk' },
  rubro: { type: String },
  is_active: { type: Boolean, default: true },
  last_login_at: { type: Date },
  metadata: Schema.Types.Mixed,
  created_by: { type: String },
  updated_by: { type: String }
}, { collection: 'users', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
UserSchema.index({ tenant_id: 1, username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { sparse: true });
module.exports = model('User', UserSchema);