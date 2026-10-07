const Receipt = require('../models/Receipt');
const { UNITS } = require('../config/constants');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parseDay, todayUTC, weekRange, monthRange } = require('../utils/dates');

async function materialBreakdown(match) {
  const rows = await Receipt.aggregate([
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: { material: '$items.material', unit: '$items.unit' }, totalQuantity: { $sum: '$items.quantity' }, receipts: { $addToSet: '$_id' } } },
    { $project: { _id: 0, material: '$_id.material', unit: '$_id.unit', totalQuantity: 1, receiptCount: { $size: '$receipts' } } },
    { $sort: { material: 1 } },
  ]);
  return rows.map((r) => ({ ...r, unitLabel: UNITS[r.unit] }));
}

const totalsFor = async (match) => {
  const [agg] = await Receipt.aggregate([
    { $match: match },
    { $group: { _id: null, totalReceipts: { $sum: 1 }, totalQuantity: { $sum: '$totalQuantity' } } },
  ]);
  return { totalReceipts: agg ? agg.totalReceipts : 0, totalQuantity: agg ? agg.totalQuantity : 0 };
};

// GET /api/reports/daily?date=YYYY-MM-DD
exports.daily = asyncHandler(async (req, res) => {
  const date = req.query.date ? parseDay(req.query.date) : todayUTC();
  if (!date) throw new ApiError(400, 'Invalid date');
  const match = { date };
  const receipts = await Receipt.find(match).select('receiptNumber donor.name totalQuantity totalsByUnit').sort({ createdAt: 1 });
  res.json({ success: true, date: date.toISOString().slice(0, 10), ...(await totalsFor(match)), materials: await materialBreakdown(match), receipts });
});

// GET /api/reports/weekly?date=YYYY-MM-DD
exports.weekly = asyncHandler(async (req, res) => {
  const date = req.query.date ? parseDay(req.query.date) : todayUTC();
  if (!date) throw new ApiError(400, 'Invalid date');
  const range = weekRange(date);
  const match = { date: { $gte: range.from, $lte: range.to } };
  const perDay = await Receipt.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, receipts: { $sum: 1 }, quantity: { $sum: '$totalQuantity' } } },
    { $project: { _id: 0, date: '$_id', receipts: 1, quantity: 1 } },
    { $sort: { date: 1 } },
  ]);
  res.json({ success: true, from: range.from.toISOString(), to: range.to.toISOString(), ...(await totalsFor(match)), perDay, materials: await materialBreakdown(match) });
});

// GET /api/reports/monthly?year=2026&month=10
exports.monthly = asyncHandler(async (req, res) => {
  const now = todayUTC();
  const year = parseInt(req.query.year, 10) || now.getUTCFullYear();
  const month = parseInt(req.query.month, 10) || now.getUTCMonth() + 1;
  const range = monthRange(year, month);
  const match = { date: { $gte: range.from, $lte: range.to } };

  const perDay = await Receipt.aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, receipts: { $sum: 1 }, quantity: { $sum: '$totalQuantity' } } },
    { $project: { _id: 0, date: '$_id', receipts: 1, quantity: 1 } },
    { $sort: { date: 1 } },
  ]);
  res.json({ success: true, year, month, from: range.from.toISOString(), to: range.to.toISOString(), ...(await totalsFor(match)), perDay, materials: await materialBreakdown(match) });
});

// GET /api/reports/material-wise?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.materialWise = asyncHandler(async (req, res) => {
  const match = {};
  const from = req.query.from && parseDay(req.query.from);
  const to = req.query.to && parseDay(req.query.to);
  if (from || to) match.date = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  res.json({ success: true, from: req.query.from || null, to: req.query.to || null, materials: await materialBreakdown(match) });
});
