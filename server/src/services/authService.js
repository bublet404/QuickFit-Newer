const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function tokenFor(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  };
}

exports.register = async ({ name, email, password }) => {
  name = String(name || "").trim();
  email = String(email || "").trim().toLowerCase();
  password = String(password || "");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !validEmail || password.length < 8) {
    throw httpError(
      400,
      "Name, valid email, and password (at least 8 characters) are required."
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw httpError(
      409,
      "An account with this email already exists."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash
  });

  return {
    token: tokenFor(user),
    user: publicUser(user)
  };
};

exports.login = async ({ email, password }) => {
  email = String(email || "").trim().toLowerCase();
  password = String(password || "");

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, "Email or password is incorrect.");
  }

  return {
    token: tokenFor(user),
    user: publicUser(user)
  };
};