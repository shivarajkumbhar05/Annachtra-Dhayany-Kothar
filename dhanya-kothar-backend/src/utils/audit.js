const AuditLog = require('../models/AuditLog');

module.exports = async function audit(userId, action, description, receiptId) {
  try {
    await AuditLog.create({ userId, action, description, receiptId });
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
};
