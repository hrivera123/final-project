require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/userModel");

async function promote(email) {
  if (!email) {
    console.error("Usage: node promoteAdmin.js <email>");
    process.exit(2);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exitCode = 1;
      return;
    }

    user.isAdmin = true;
    await user.save();
    console.log(`User ${email} updated: isAdmin = ${user.isAdmin}`);
    process.exitCode = 0;
  } catch (err) {
    console.error("Error promoting user:", err.message || err);
    process.exitCode = 3;
  } finally {
    try { await mongoose.disconnect(); } catch (e) {}
  }
}

const email = process.argv[2];
promote(email);
