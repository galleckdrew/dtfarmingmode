const mongoose = require("mongoose");

const tractorSchema = new mongoose.Schema({
  name: String,
  gallons: Number, // ✅ default gallons set by admin
});

module.exports = mongoose.model("Tractor", tractorSchema);
