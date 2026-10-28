const Outfit = require("../models/Outfit");
const Item = require("../models/Item");

const itemPopulate = {
  path: "itemIds",
  select: "name category color imageUri"
};

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function ownedOutfit(id, userId) {
  const outfit = await Outfit.findOne({
    _id: id,
    user: userId
  });

  if (!outfit) {
    return null;
  }

  await outfit.populate({
    ...itemPopulate,
    match: { user: userId }
  });

  return outfit;
}

async function validateOwnedItems(itemIds, userId) {
  const ownedItems = await Item.find({
    _id: { $in: itemIds },
    user: userId
  }).select("_id");

  if (ownedItems.length !== itemIds.length) {
    throw httpError(
      400,
      "One or more selected clothing items are invalid."
    );
  }

  return ownedItems.map((item) => item._id);
}

exports.list = async (userId) => {
  return Outfit.find({ user: userId })
    .sort({ updatedAt: -1 })
    .populate({
      ...itemPopulate,
      match: { user: userId }
    });
};

exports.create = async (userId, body) => {
  const name = String(body.name || "").trim();

  if (!name) {
    throw httpError(400, "Outfit name is required.");
  }

  const itemIds = Array.isArray(body.itemIds)
    ? body.itemIds
    : [];

  const ownedItemIds = await validateOwnedItems(itemIds, userId);

  const outfit = await Outfit.create({
    user: userId,
    name,
    category: body.category || "Everyday",
    itemIds: ownedItemIds,
    notes: body.notes || ""
  });

  return ownedOutfit(outfit._id, userId);
};

exports.getById = async (userId, id) => {
  return ownedOutfit(id, userId);
};

exports.update = async (userId, id, body) => {
  const update = {};

  ["name", "category", "notes"].forEach((key) => {
    if (body[key] !== undefined) {
      update[key] = body[key];
    }
  });

  if (update.name !== undefined) {
    update.name = String(update.name).trim();

    if (!update.name) {
      throw httpError(400, "Outfit name is required.");
    }
  }

  if (body.itemIds !== undefined) {
    if (!Array.isArray(body.itemIds)) {
      throw httpError(400, "itemIds must be an array.");
    }

    update.itemIds = await validateOwnedItems(
      body.itemIds,
      userId
    );
  }

  const outfit = await Outfit.findOneAndUpdate(
    {
      _id: id,
      user: userId
    },
    {
      $set: update
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!outfit) {
    return null;
  }

  return ownedOutfit(outfit._id, userId);
};

exports.remove = async (userId, id) => {
  return Outfit.findOneAndDelete({
    _id: id,
    user: userId
  });
};

exports.recordWear = async (userId, id, wornAt) => {
  let date;

  if (wornAt) {
    date = new Date(wornAt);

    if (Number.isNaN(date.getTime())) {
      throw httpError(400, "wornAt must be a valid date.");
    }
  } else {
    date = new Date();
  }

  const outfit = await Outfit.findOneAndUpdate(
    {
      _id: id,
      user: userId
    },
    {
      $push: {
        wearHistory: { wornAt: date }
      }
    },
    {
      new: true
    }
  );

  if (!outfit) {
    return null;
  }

  await outfit.populate({
    ...itemPopulate,
    match: { user: userId }
  });

  return outfit;
};