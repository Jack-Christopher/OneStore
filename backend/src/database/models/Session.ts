export { }; // Empty export to force module scope
const { Schema, model } = require("mongoose");

const SessionSchema = new Schema({
  user_id: { type: String, required: true, index: true },
  tenant_id: { type: String, required: true, index: true },
  ip_address: { type: String },
  user_agent: { type: String },
  last_activity: { type: Date, required: true },
  expires_at: { type: Date }
}, { collection: 'sessions', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
SessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
module.exports = model('Session', SessionSchema);
