const mongoose = require('mongoose');

// Single-document collection (key: "main")
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    organizationName: { type: String, default: 'श्री स्वामी समर्थ अन्नछत्र मंडळ' },
    trustNumber: { type: String, default: 'ट्रस्ट एफ-२२७९' },
    address: { type: String, default: 'अक्कलकोट' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    receiptHeaderTop: { type: String, default: '॥ श्री स्वामी समर्थ ॥' },
    receiptTitle: { type: String, default: 'धान्य कोठार पावती' },
    receiptPrefix: { type: String, default: 'DK' },
    paperSize: { type: String, enum: ['A4', 'A5', 'THERMAL58', 'THERMAL80'], default: 'A5' },
  },
  { timestamps: true }
);

settingSchema.statics.get = async function () {
  return (await this.findOne({ key: 'main' })) || (await this.create({ key: 'main' }));
};

module.exports = mongoose.model('Setting', settingSchema);
