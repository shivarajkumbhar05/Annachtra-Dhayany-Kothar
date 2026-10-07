// Dates are stored as UTC midnight of the chosen calendar day (YYYY-MM-DD)
const parseDay = (str) => {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(`${str}T00:00:00.000Z`);
  return isNaN(d) ? null : d;
};

const todayUTC = () => {
  // IST calendar day (Akkalkot, India)
  const ist = new Date(Date.now() + 5.5 * 3600 * 1000);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
};

const weekRange = (date) => {
  const day = date.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  const from = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysSinceMonday));
  const to = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 6, 23, 59, 59, 999));
  return { from, to };
};

const monthRange = (year, month) => {
  if (!Number.isInteger(year) || year < 1 || year > 9999) throw new RangeError('Invalid year');
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError('Invalid month');
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from, to };
};

module.exports = { parseDay, todayUTC, weekRange, monthRange };
