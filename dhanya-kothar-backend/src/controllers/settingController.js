const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const audit = require('../utils/audit');

const FIELDS = ['organizationName', 'trustNumber', 'address', 'phone', 'email', 'receiptHeaderTop', 'receiptTitle', 'receiptPrefix', 'paperSize'];

exports.get = asyncHandler(async (req, res) => res.json({ success: true, settings: await Setting.get() }));

exports.update = asyncHandler(async (req, res) => {
  const settings = await Setting.get();
  FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) settings[f] = req.body[f];
  });
  await settings.save();
  await audit(req.user._id, 'UPDATE_SETTINGS', 'System settings updated');
  res.json({ success: true, settings });
});

exports.auditLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const logs = await AuditLog.find().populate('userId', 'name username').sort({ timestamp: -1 }).limit(limit);
  res.json({ success: true, logs });
});
