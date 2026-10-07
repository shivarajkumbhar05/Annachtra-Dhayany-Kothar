const mongoose = require('mongoose');
const { UNITS } = require('../config/constants');

const itemSchema = new mongoose.Schema(
  {
    material: { type: String, required: true, trim: true },
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    quantity: { type: Number, required: true, min: 0.001 },
    unit: { type: String, required: true, enum: Object.keys(UNITS) },
  },
  { _id: false }
);

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    date: { type: Date, required: true, index: true },
    donor: {
      name: { type: String, required: true, trim: true },
      mobile: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
    },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    totalQuantity: { type: Number, required: true }, // plain sum of quantities (SRS FR-08)
    totalsByUnit: [{ _id: false, unit: String, quantity: Number }], // accurate when units are mixed
    remarks: { type: String, trim: true, default: '' },
    reprintCount: { type: Number, default: 0 },
    editHistory: [
      {
        _id: false,
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: Date,
        reason: String,
        previous: Object,
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

receiptSchema.index({ 'donor.name': 1 });
receiptSchema.index({ 'donor.mobile': 1 });

module.exports = mongoose.model('Receipt', receiptSchema);
