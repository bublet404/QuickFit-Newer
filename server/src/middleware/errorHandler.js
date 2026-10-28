module.exports = function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err && err.code === 11000) {
    return res.status(409).json({
      message: "A record with that value already exists."
    });
  }

  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message
    });
  }

  if (err && err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID or value."
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Server error"
  });
};