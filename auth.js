const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// ✅ Show login form
router.get("/login", (req, res) => {
  res.render("login");
});

// ✅ Show register form
router.get("/register", (req, res) => {
  res.render("register");
});

// ✅ Handle login (with session)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("🔐 Login attempt:", username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ No user found");
      return res.status(401).send("❌ Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).send("❌ Invalid username or password");
    }

    // ✅ Save session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    res.send(`
      <script>
        alert("✅ Login successful!");
        window.location.href = "/submit-load";
      </script>
    `);
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send("❌ Server error");
  }
});

// ✅ Handle registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send("❌ User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    res.send("✅ Driver registered successfully. <a href='/auth/login'>Login here</a>");
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).send("❌ Registration failed");
  }
});

module.exports = router;
