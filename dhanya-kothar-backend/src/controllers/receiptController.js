const Receipt = require('../models/Receipt');
const Counter = require('../models/Counter');
const Setting = require('../models/Setting');
const { UNITS } = require('../config/constants');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const audit = require('../utils/audit');
const { parseDay, todayUTC } = require('../utils/dates');
const { validateReceiptInput, computeTotals, escapeRegex, normalizeMobile } = require('../utils/validators');

async function nextReceiptNumber(date) {
  const year = date.getUTCFullYear();
  const settings = await Setting.get();
  const seq = await Counter.next(`receipt-${year}`);
  return `${settings.receiptPrefix || 'DK'}-${year}-${String(seq).padStart(5, '0')}`;
}

// Attach Marathi unit labels so the frontend can print directly
const withLabels = (r) => {
  const o = r.toObject ? r.toObject() : r;
  o.items = o.items.map((i) => ({ ...i, unitLabel: UNITS[i.unit] }));
  o.totalsByUnit = (o.totalsByUnit || []).map((t) => ({ ...t, unitLabel: UNITS[t.unit] }));
  return o;
};

exports.create = asyncHandler(async (req, res) => {
  const { errors, data } = validateReceiptInput(req.body);
  if (errors.length) throw new ApiError(400, errors[0], errors);

  const date = data.date || todayUTC();
  const totals = computeTotals(data.items);

  let receipt;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      receipt = await Receipt.create({
        ...data,
        date,
        ...totals,
        receiptNumber: await nextReceiptNumber(date),
        createdBy: req.user._id,
      });
      break;
    } catch (err) {
      if (err.code !== 11000 || attempt === 2) throw err;
    }
  }

  await audit(req.user._id, 'CREATE_RECEIPT', `Created receipt ${receipt.receiptNumber}`, receipt._id);
  const settings = await Setting.get();
  res.status(201).json({ success: true, receipt: withLabels(receipt), settings });
});

exports.list = asyncHandler(async (req, res) => {
  const { receiptNumber, donorName, mobile, date, from, to } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const filter = {};

  if (receiptNumber) filter.receiptNumber = new RegExp(escapeRegex(receiptNumber.trim()), 'i');
  if (donorName) filter['donor.name'] = new RegExp(escapeRegex(donorName.trim()), 'i');
  if (mobile) filter['donor.mobile'] = new RegExp(escapeRegex(normalizeMobile(mobile)));
  if (date) {
    const d = parseDay(date);
    if (!d) throw new ApiError(400, 'Invalid date');
    filter.date = d;
  } else if (from || to) {
    filter.date = {};
    if (from && parseDay(from)) filter.date.$gte = parseDay(from);
    if (to && parseDay(to)) filter.date.$lte = parseDay(to);
  }

  const [receipts, total] = await Promise.all([
    Receipt.find(filter)
      .select('receiptNumber date donor.name donor.mobile totalQuantity totalsByUnit createdAt')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Receipt.countDocuments(filter),
  ]);

  res.json({ success: true, receipts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id).populate('createdBy', 'name username');
  if (!receipt) throw new ApiError(404, 'Receipt not found');
  res.json({ success: true, receipt: withLabels(receipt), settings: await Setting.get() });
});

exports.getByNumber = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findOne({ receiptNumber: req.params.number }).populate('createdBy', 'name username');
  if (!receipt) throw new ApiError(404, 'Receipt not found');
  res.json({ success: true, receipt: withLabels(receipt), settings: await Setting.get() });
});

// Called when staff reprints; receipt number never changes (FR-14)
exports.reprint = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findByIdAndUpdate(req.params.id, { $inc: { reprintCount: 1 } }, { new: true });
  if (!receipt) throw new ApiError(404, 'Receipt not found');
  await audit(req.user._id, 'REPRINT_RECEIPT', `Reprinted receipt ${receipt.receiptNumber}`, receipt._id);
  res.json({ success: true, receipt: withLabels(receipt), settings: await Setting.get() });
});

// Controlled correction: admin only, reason mandatory, previous version kept
exports.update = asyncHandler(async (req, res) => {
  const reason = String(req.body.reason || '').trim();
  if (!reason) throw new ApiError(400, 'दुरुस्तीचे कारण आवश्यक आहे.');

  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) throw new ApiError(404, 'Receipt not found');

  const { errors, data } = validateReceiptInput({ ...req.body, date: req.body.date || receipt.date.toISOString().slice(0, 10) });
  if (errors.length) throw new ApiError(400, errors[0], errors);

  receipt.editHistory.push({
    editedBy: req.user._id,
    editedAt: new Date(),
    reason,
    previous: { date: receipt.date, donor: receipt.donor, items: receipt.items, totalQuantity: receipt.totalQuantity, remarks: receipt.remarks },
  });
  receipt.date = data.date || receipt.date;
  receipt.donor = data.donor;
  receipt.items = data.items;
  receipt.remarks = data.remarks;
  Object.assign(receipt, computeTotals(data.items));
  await receipt.save(); // receiptNumber intentionally untouched

  await audit(req.user._id, 'EDIT_RECEIPT', `Corrected receipt ${receipt.receiptNumber}: ${reason}`, receipt._id);
  res.json({ success: true, receipt: withLabels(receipt) });
});
