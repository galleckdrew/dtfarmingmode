const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  tractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tractor",
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Field",
    default: null
  },
  pump: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pump",
    default: null
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    default: null
  },
  trailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trailer",
    default: null
  },
  sand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sand",
    default: null
  },
  startHour: {
    type: Number,
    required: true
  },
  endHour: {
    type: Number,
    default: null
  },
  totalHours: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Transfer", transferSchema);
