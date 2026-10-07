const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDay, weekRange, monthRange } = require('../src/utils/dates');

test('weekly report boundaries are Monday through Sunday', () => {
  const range = weekRange(parseDay('2026-10-07'));

  assert.equal(range.from.toISOString(), '2026-10-05T00:00:00.000Z');
  assert.equal(range.to.toISOString(), '2026-10-11T23:59:59.999Z');
});

test('weekly report boundaries are inclusive for a Sunday', () => {
  const range = weekRange(parseDay('2026-10-11'));

  assert.equal(range.from.toISOString(), '2026-10-05T00:00:00.000Z');
  assert.equal(range.to.toISOString(), '2026-10-11T23:59:59.999Z');
});

test('monthly report boundaries include every day of the selected month', () => {
  const range = monthRange(2026, 10);

  assert.equal(range.from.toISOString(), '2026-10-01T00:00:00.000Z');
  assert.equal(range.to.toISOString(), '2026-10-31T23:59:59.999Z');
});

test('monthly report boundaries reject invalid months', () => {
  assert.throws(() => monthRange(2026, 13), /month/i);
  assert.throws(() => monthRange(0, 1), /year/i);
});
