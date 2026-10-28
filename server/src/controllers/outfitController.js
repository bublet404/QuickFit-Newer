const outfitService = require("../services/outfitService");

exports.list = async (req, res, next) => {
  try {
    res.json(await outfitService.list(req.userId));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const outfit = await outfitService.create(
      req.userId,
      req.body || {}
    );

    res.status(201).json(outfit);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const outfit = await outfitService.getById(
      req.userId,
      req.params.id
    );

    if (!outfit) {
      return res.status(404).json({
        message: "Outfit not found."
      });
    }

    res.json(outfit);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const outfit = await outfitService.update(
      req.userId,
      req.params.id,
      req.body || {}
    );

    if (!outfit) {
      return res.status(404).json({
        message: "Outfit not found."
      });
    }

    res.json(outfit);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const outfit = await outfitService.remove(
      req.userId,
      req.params.id
    );

    if (!outfit) {
      return res.status(404).json({
        message: "Outfit not found."
      });
    }

    res.json({
      message: "Outfit deleted."
    });
  } catch (err) {
    next(err);
  }
};

exports.recordWear = async (req, res, next) => {
  try {
    const outfit = await outfitService.recordWear(
      req.userId,
      req.params.id,
      (req.body || {}).wornAt
    );

    if (!outfit) {
      return res.status(404).json({
        message: "Outfit not found."
      });
    }

    res.json(outfit);
  } catch (err) {
    next(err);
  }
};