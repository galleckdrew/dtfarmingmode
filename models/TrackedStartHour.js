const mongoose = require('mongoose');

const trackedStartHourSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor', required: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  startHour: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrackedStartHour', trackedStartHourSchema);
