const mongoose = require("mongoose");

const outfitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    trim: true,
    default: "Everyday"
  },
  itemIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  }],
  notes: {
    type: String,
    trim: true,
    default: ""
  },
  wearHistory: [{
    wornAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("Outfit", outfitSchema);