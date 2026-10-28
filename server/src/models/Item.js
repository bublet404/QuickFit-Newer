const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, trim: true, default: "Other" },
  color: { type: String, trim: true, default: "" },
  season: { type: String, trim: true, default: "All season" },
  tags: [{ type: String, trim: true }],
  imageUri: { type: String, default: "" },
  notes: { type: String, trim: true, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
