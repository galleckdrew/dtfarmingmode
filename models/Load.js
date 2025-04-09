const mongoose = require("mongoose");

const loadSchema = new mongoose.Schema({
  tractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tractor",
    required: true
  },
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Field",
    required: true
  },
  pit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pit",
    required: true
  },
  gallons: {
    type: Number,
    required: true
  },
  startHour: {
    type: Number,
    required: true
  },
  endHour: {
    type: Number
  },
  totalHours: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Load", loadSchema);
