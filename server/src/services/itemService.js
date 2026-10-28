const Item = require("../models/Item");
const Outfit = require("../models/Outfit");

const fields = [
  "name",
  "category",
  "color",
  "season",
  "tags",
  "imageUri",
  "notes"
];

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function pick(body) {
  const out = {};

  fields.forEach((key) => {
    if (body[key] !== undefined) {
      out[key] = body[key];
    }
  });

  if (typeof out.tags === "string") {
    out.tags = out.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (out.name !== undefined) {
    out.name = String(out.name).trim();
  }

  return out;
}

exports.list = async (userId, category) => {
  const filter = { user: userId };

  if (category) {
    filter.category = category;
  }

  return Item.find(filter).sort({ updatedAt: -1 });
};

exports.create = async (userId, body) => {
  const data = pick(body);

  if (!data.name) {
    throw httpError(400, "Item name is required.");
  }

  return Item.create({
    ...data,
    user: userId
  });
};

exports.getById = async (userId, id) => {
  return Item.findOne({
    _id: id,
    user: userId
  });
};

exports.update = async (userId, id, body) => {
  const data = pick(body);

  if (data.name !== undefined && !data.name) {
    throw httpError(400, "Item name is required.");
  }

  return Item.findOneAndUpdate(
    {
      _id: id,
      user: userId
    },
    {
      $set: data
    },
    {
      new: true,
      runValidators: true
    }
  );
};

exports.remove = async (userId, id) => {
  const item = await Item.findOneAndDelete({
    _id: id,
    user: userId
  });

  if (!item) {
    return null;
  }

  // Remove this clothing item from any outfits owned by this user.
  await Outfit.updateMany(
    { user: userId },
    { $pull: { itemIds: item._id } }
  );

  return item;
};