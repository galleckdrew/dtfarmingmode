const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: "Tractor", required: true },
  pump: { type: mongoose.Schema.Types.ObjectId, ref: "Pump", required: false },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" },
  trailer: { type: mongoose.Schema.Types.ObjectId, ref: "Trailer" },
  sand: { type: mongoose.Schema.Types.ObjectId, ref: "Sand" },
  field: { type: mongoose.Schema.Types.ObjectId, ref: "Field" },
  startHour: { type: Number, required: true },
  endHour: { type: Number, required: false },
  totalHours: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transfer", transferSchema);
