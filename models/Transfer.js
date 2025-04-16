// models/Transfer.js
const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: "Tractor", required: true },
  pump: { type: String, required: true },
  farmer: { type: String, required: true },
  startHour: { type: Number, required: true },
  endHour: { type: Number, required: true },
  totalHours: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transfer", transferSchema);
