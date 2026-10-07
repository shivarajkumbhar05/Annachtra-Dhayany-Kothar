const mongoose = require('mongoose');
const { UNITS } = require('../config/constants');

const materialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    unit: { type: String, enum: Object.keys(UNITS), default: 'Kg' },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
