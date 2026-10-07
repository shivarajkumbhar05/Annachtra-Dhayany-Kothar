const mongoose = require('mongoose');

// Atomic sequence generator (one document per receipt year, e.g. "receipt-2026")
const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

counterSchema.statics.next = async function (key) {
  const doc = await this.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
