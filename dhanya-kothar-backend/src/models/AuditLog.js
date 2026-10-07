const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' },
  description: String,
  timestamp: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
