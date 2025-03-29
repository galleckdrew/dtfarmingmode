const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Show register form
router.get("/register", (req, res) => {
  res.render("register");
});


// ✅ Show login form
router.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Handle login (redirect to form)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send("❌ Invalid username or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("❌ Invalid username or password");

    res.redirect("/submit-load"); // ✅ Go to driver load form
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send("❌ Server error");
  }
});

// ✅ Handle registration
router.post("/register", async (req, res) => {
  const { username, password, role = "driver" } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send("❌ User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.send("✅ Driver registered successfully");
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).send("❌ Registration failed");
  }
});

module.exports = router;
