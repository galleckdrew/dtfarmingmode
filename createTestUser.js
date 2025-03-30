const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createTestUser() {
  await mongoose.connect(process.env.MONGO_URI);

  const username = "testdriver";
  const password = "test123";

  const existing = await User.findOne({ username });
  if (existing) {
    console.log("User already exists. ✅");
    return process.exit();
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashedPassword, role: "driver" });

  console.log("✅ Test user created: testdriver / test123");
  process.exit();
}

createTestUser().catch(err => {
  console.error("❌ Error creating test user:", err);
  process.exit(1);
});
