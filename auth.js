const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/User");

// ✅ REGISTER
router.post("/register", async (req, res) => {
  const { username, password, role = "driver" } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "❌ User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.json({ message: "✅ Tractor registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "❌ Registration failed" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "❌ Login error" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "❌ Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "2h",
    });

    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "❌ Login failed" });
  }
});

module.exports = router;
