const mongoose = require("mongoose");

const loadSchema = new mongoose.Schema({
  tractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tractor",
    required: true,
  },
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Field",
    required: false, // ✅ Optional now
  },
  pit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pit",
    required: false, // ✅ Optional now
  },
  gallons: Number,
  startHour: Number,
  endHour: Number,
  totalHours: Number,
  timestamp: Date,
});

module.exports = mongoose.model("Load", loadSchema);
