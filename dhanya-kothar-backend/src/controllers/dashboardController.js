const Receipt = require('../models/Receipt');
const Material = require('../models/Material');
const asyncHandler = require('../utils/asyncHandler');
const { todayUTC } = require('../utils/dates');

exports.summary = asyncHandler(async (req, res) => {
  const today = todayUTC();
  const [todayAgg, totalReceipts, totalMaterials, recent] = await Promise.all([
    Receipt.aggregate([
      { $match: { date: today } },
      { $group: { _id: null, count: { $sum: 1 }, quantity: { $sum: '$totalQuantity' } } },
    ]),
    Receipt.countDocuments(),
    Material.countDocuments({ status: 'active' }),
    Receipt.find().select('receiptNumber date donor.name totalQuantity').sort({ createdAt: -1 }).limit(10),
  ]);

  res.json({
    success: true,
    todayReceipts: todayAgg[0] ? todayAgg[0].count : 0,
    todayQuantity: todayAgg[0] ? todayAgg[0].quantity : 0,
    totalReceipts,
    totalMaterials,
    recentReceipts: recent,
  });
});
