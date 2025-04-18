const mongoose = require("mongoose");

const loadSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: "Tractor", required: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: "Farm" },
  field: { type: mongoose.Schema.Types.ObjectId, ref: "Field" },
  pit: { type: mongoose.Schema.Types.ObjectId, ref: "Pit" },
  gallons: Number,
  startHour: Number,
  endHour: Number,
  totalHours: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Load", loadSchema);
