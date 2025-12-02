const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ msg: "Email already registered." });

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPwd
    });

    res.json({ msg: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Incorrect password." });

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
