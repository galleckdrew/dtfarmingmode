const mongoose = require("mongoose");

const fuelSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: "Tractor", required: true },
  field: { type: mongoose.Schema.Types.ObjectId, ref: "Field", required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Fuel", fuelSchema);
