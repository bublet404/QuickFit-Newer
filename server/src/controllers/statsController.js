const statsService = require("../services/statsService");

exports.getStats = async (req, res, next) => {
  try {
    const stats = await statsService.getStats(req.userId);

    res.json(stats);
  } catch (err) {
    next(err);
  }
};