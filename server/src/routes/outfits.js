const router = require("express").Router();
const Outfit = require("../models/Outfit");
const Item = require("../models/Item");
const auth = require("../middleware/auth");
router.use(auth);

const populate = { path: "itemIds", match: { user: undefined } };
async function ownedOutfit(id, userId) {
  return Outfit.findOne({ _id: id, user: userId }).populate({
    path: "itemIds", match: { user: userId }, select: "name category color imageUri"
  });
}

router.get("/", async (req, res, next) => {
  try {
    const outfits = await Outfit.find({ user: req.userId }).sort({ updatedAt: -1 }).populate({
      path: "itemIds", match: { user: req.userId }, select: "name category color imageUri"
    });
    res.json(outfits);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Outfit name is required." });
    const itemIds = Array.isArray(req.body.itemIds) ? req.body.itemIds : [];
    const ownedItems = await Item.find({ _id: { $in: itemIds }, user: req.userId }).select("_id");
    if (ownedItems.length !== itemIds.length) return res.status(400).json({ message: "One or more selected clothing items are invalid." });
    const outfit = await Outfit.create({
      user: req.userId, name, category: req.body.category || "Everyday",
      itemIds: ownedItems.map(i => i._id), notes: req.body.notes || ""
    });
    res.status(201).json(await ownedOutfit(outfit._id, req.userId));
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const outfit = await ownedOutfit(req.params.id, req.userId);
    if (!outfit) return res.status(404).json({ message: "Outfit not found." });
    res.json(outfit);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const update = {};
    ["name", "category", "notes"].forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (req.body.itemIds !== undefined) {
      if (!Array.isArray(req.body.itemIds)) return res.status(400).json({ message: "itemIds must be an array." });
      const ownedItems = await Item.find({ _id: { $in: req.body.itemIds }, user: req.userId }).select("_id");
      if (ownedItems.length !== req.body.itemIds.length) return res.status(400).json({ message: "One or more selected clothing items are invalid." });
      update.itemIds = ownedItems.map(i => i._id);
    }
    const outfit = await Outfit.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { $set: update }, { new: true, runValidators: true });
    if (!outfit) return res.status(404).json({ message: "Outfit not found." });
    res.json(await ownedOutfit(outfit._id, req.userId));
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const outfit = await Outfit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!outfit) return res.status(404).json({ message: "Outfit not found." });
    res.json({ message: "Outfit deleted." });
  } catch (err) { next(err); }
});

router.post("/:id/wear", async (req, res, next) => {
  try {
    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $push: { wearHistory: { wornAt: req.body.wornAt ? new Date(req.body.wornAt) : new Date() } } },
      { new: true }
    ).populate({ path: "itemIds", match: { user: req.userId }, select: "name category color imageUri" });
    if (!outfit) return res.status(404).json({ message: "Outfit not found." });
    res.json(outfit);
  } catch (err) { next(err); }
});

module.exports = router;
