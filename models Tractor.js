const mongoose = require("mongoose");

const TractorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Tractor", TractorSchema);
