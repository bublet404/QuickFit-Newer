const router = require("express").Router();
const auth = require("../middleware/auth");
const Item = require("../models/Item");
const Outfit = require("../models/Outfit");
router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const [itemCount, outfitDocs, categoryCounts] = await Promise.all([
      Item.countDocuments({ user: req.userId }),
      Outfit.find({ user: req.userId }).select("name category wearHistory"),
      Item.aggregate([
        { $match: { user: require("mongoose").Types.ObjectId.createFromHexString(req.userId) } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);
    const outfitsWorn = outfitDocs.reduce((sum, outfit) => sum + outfit.wearHistory.length, 0);
    const mostWorn = outfitDocs
      .map(o => ({ id: o._id, name: o.name, count: o.wearHistory.length }))
      .sort((a, b) => b.count - a.count)[0] || null;
    res.json({ itemCount, outfitCount: outfitDocs.length, outfitsWorn, mostWorn, categoryCounts });
  } catch (err) { next(err); }
});

module.exports = router;
