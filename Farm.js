const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model("Farm", farmSchema);
