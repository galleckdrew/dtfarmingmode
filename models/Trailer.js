// models/Trailer.js
const mongoose = require("mongoose");
const pumpSchema = new mongoose.Schema({
  name: { type: String, required: true }
});
module.exports = mongoose.models.Trailer || mongoose.model("Trailer", pumpSchema);

