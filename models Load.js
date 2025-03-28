const mongoose = require("mongoose");

const loadSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: "Tractor", required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: "Location", required: true },
  gallons: { type: Number, required: true },
  startHour: { type: Number, required: true },
  endHour: { type: Number, required: true }
}, { timestamps: true }); // <== this is important

module.exports = mongoose.model("Load", loadSchema);
