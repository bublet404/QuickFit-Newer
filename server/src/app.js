const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const outfitRoutes = require("./routes/outfits");
const statsRoutes = require("./routes/stats");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "QuickFit API"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/stats", statsRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

app.use(errorHandler);

module.exports = app;