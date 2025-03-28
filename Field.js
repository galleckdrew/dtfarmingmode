const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

module.exports = mongoose.model("Field", fieldSchema);
