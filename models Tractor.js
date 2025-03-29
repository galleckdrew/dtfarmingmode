const mongoose = require("mongoose");

const tractorSchema = new mongoose.Schema({
  name: String,
  gallons: Number // ✅ This line adds gallons
});

module.exports = mongoose.model("Tractor", tractorSchema);
