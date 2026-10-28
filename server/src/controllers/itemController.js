const itemService = require("../services/itemService");

exports.list = async (req, res, next) => {
  try {
    const items = await itemService.list(
      req.userId,
      req.query.category
    );

    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await itemService.create(
      req.userId,
      req.body || {}
    );

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await itemService.getById(
      req.userId,
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found."
      });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await itemService.update(
      req.userId,
      req.params.id,
      req.body || {}
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found."
      });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await itemService.remove(
      req.userId,
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found."
      });
    }

    res.json({
      message: "Item deleted."
    });
  } catch (err) {
    next(err);
  }
};