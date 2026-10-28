const mongoose = require("mongoose");
const Item = require("../models/Item");
const Outfit = require("../models/Outfit");

exports.getStats = async (userId) => {
  const [itemCount, outfitDocs, categoryCounts] =
    await Promise.all([
      Item.countDocuments({ user: userId }),

      Outfit.find({ user: userId })
        .select("name category wearHistory"),

      Item.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
    ]);

  const outfitsWorn = outfitDocs.reduce(
    (sum, outfit) => sum + outfit.wearHistory.length,
    0
  );

  const mostWorn = outfitDocs
    .map((outfit) => ({
      id: outfit._id,
      name: outfit.name,
      count: outfit.wearHistory.length
    }))
    .sort((a, b) => b.count - a.count)[0] || null;

  return {
    itemCount,
    outfitCount: outfitDocs.length,
    outfitsWorn,
    mostWorn,
    categoryCounts
  };
};