const Material = require('../models/Material');
const { UNITS } = require('../config/constants');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const audit = require('../utils/audit');

exports.units = (req, res) =>
  res.json({ success: true, units: Object.entries(UNITS).map(([key, label]) => ({ key, label })) });

exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  // Only admin may request disabled materials too (?status=all)
  if (req.user.role !== 'admin' || req.query.status !== 'all') filter.status = 'active';
  const materials = await Material.find(filter).sort({ name: 1 });
  res.json({ success: true, materials });
});

exports.create = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const unit = req.body.unit || 'Kg';
  if (!name) throw new ApiError(400, 'वस्तूचे नाव आवश्यक आहे.');
  if (!UNITS[unit]) throw new ApiError(400, 'एकक चुकीचे आहे.');
  if (await Material.findOne({ name })) throw new ApiError(409, 'ही वस्तू आधीच अस्तित्वात आहे.');
  const material = await Material.create({ name, unit });
  await audit(req.user._id, 'CREATE_MATERIAL', `Added material ${name}`);
  res.status(201).json({ success: true, material });
});

exports.update = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) throw new ApiError(404, 'Material not found');
  const { name, unit, status } = req.body;
  if (name) material.name = String(name).trim();
  if (unit) {
    if (!UNITS[unit]) throw new ApiError(400, 'एकक चुकीचे आहे.');
    material.unit = unit;
  }
  if (status) {
    if (!['active', 'disabled'].includes(status)) throw new ApiError(400, 'Invalid status');
    material.status = status;
  }
  await material.save();
  await audit(req.user._id, 'UPDATE_MATERIAL', `Updated material ${material.name}`);
  res.json({ success: true, material });
});

// "Delete" = disable, so old receipts stay consistent
exports.disable = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) throw new ApiError(404, 'Material not found');
  material.status = 'disabled';
  await material.save();
  await audit(req.user._id, 'DISABLE_MATERIAL', `Disabled material ${material.name}`);
  res.json({ success: true, material });
});
