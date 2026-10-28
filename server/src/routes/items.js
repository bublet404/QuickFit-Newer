const router = require("express").Router();
const Item = require("../models/Item");
const auth = require("../middleware/auth");

router.use(auth);
const fields = ["name", "category", "color", "season", "tags", "imageUri", "notes"];
function pick(body) {
  const out = {};
  fields.forEach((key) => { if (body[key] !== undefined) out[key] = body[key]; });
  if (typeof out.tags === "string") out.tags = out.tags.split(",").map(s => s.trim()).filter(Boolean);
  return out;
}

router.get("/", async (req, res, next) => {
  try {
    const filter = { user: req.userId };
    if (req.query.category) filter.category = req.query.category;
    res.json(await Item.find(filter).sort({ updatedAt: -1 }));
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!data.name || !String(data.name).trim()) return res.status(400).json({ message: "Item name is required." });
    res.status(201).json(await Item.create({ ...data, user: req.userId }));
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json(item);
  } catch (err) { next(err); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, { $set: pick(req.body) },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found." });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found." });
    await require("../models/Outfit").updateMany({ user: req.userId }, { $pull: { itemIds: item._id } });
    res.json({ message: "Item deleted." });
  } catch (err) { next(err); }
});

module.exports = router;
