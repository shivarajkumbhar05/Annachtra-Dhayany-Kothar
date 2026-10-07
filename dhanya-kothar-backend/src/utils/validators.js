const { UNITS } = require('../config/constants');
const { parseDay } = require('./dates');

const MOBILE_RE = /^(\+91|91|0)?[6-9]\d{9}$/;
const normalizeMobile = (m) => String(m || '').replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');

function validateReceiptInput(body) {
  const errors = [];
  const donor = body.donor || {};
  const name = String(donor.name || '').trim();
  if (!name) errors.push('मान देणाऱ्याचे नाव भरा.');

  let mobile = '';
  if (donor.mobile && String(donor.mobile).trim()) {
    if (!MOBILE_RE.test(String(donor.mobile).replace(/[\s-]/g, ''))) errors.push('मोबाईल नंबर चुकीचा आहे.');
    else mobile = normalizeMobile(donor.mobile);
  }

  const date = parseDay(body.date);
  if (body.date && !date) errors.push('दिनांक चुकीचा आहे (YYYY-MM-DD).');

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) errors.push('किमान एक वस्तू add करा.');

  const items = rawItems.map((it, i) => {
    const material = String(it.material || '').trim();
    const quantity = Number(it.quantity);
    const unit = it.unit;
    if (!material) errors.push(`ओळ ${i + 1}: वस्तूचे नाव आवश्यक आहे.`);
    if (!(quantity > 0)) errors.push(`ओळ ${i + 1}: प्रमाण 0 पेक्षा जास्त असावे.`);
    if (!UNITS[unit]) errors.push(`ओळ ${i + 1}: एकक चुकीचे आहे.`);
    return { material, materialId: it.materialId || undefined, quantity, unit };
  });

  return {
    errors,
    data: {
      date,
      donor: { name, mobile, address: String(donor.address || '').trim() },
      items,
      remarks: String(body.remarks || '').trim(),
    },
  };
}

function computeTotals(items) {
  const round = (n) => Math.round(n * 1000) / 1000;
  const totalQuantity = round(items.reduce((s, i) => s + i.quantity, 0));
  const map = {};
  items.forEach((i) => (map[i.unit] = (map[i.unit] || 0) + i.quantity));
  const totalsByUnit = Object.entries(map).map(([unit, q]) => ({ unit, quantity: round(q) }));
  return { totalQuantity, totalsByUnit };
}

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { validateReceiptInput, computeTotals, escapeRegex, normalizeMobile };
