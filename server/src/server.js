require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const port = Number(process.env.PORT) || 5000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI. Add it to server/.env");
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET. Add it to server/.env");
    process.exit(1);
  }

  try {
    await connectDB();

    app.listen(port, "0.0.0.0", () => {
      console.log(`QuickFit API listening on port ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

start();