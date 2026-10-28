
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

require("node:dns").setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

require("dotenv").config();

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new Error("Please provide a valid ADMIN_EMAIL");
    }

    if (typeof password !== "string" || password.length < 12) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 12 characters"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    let admin = await User.findOne({ email });

    if (admin) {
      // Promote the existing account without changing its password.
      admin.role = "admin";
      await admin.save();

      console.log("Existing account promoted to admin");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);

      admin = await User.create({
        name: "Restaurant Admin",
        email,
        password: hashedPassword,
        role: "admin"
      });

      console.log("Admin account created successfully");
    }

    console.log("Admin email:", admin.email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

createAdmin();
