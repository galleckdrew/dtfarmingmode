// models/Calf.js
const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  date: Date,
  weight: Number
});

const calfSchema = new mongoose.Schema({
  calfId: { type: String, required: true },
  birthDate: { type: Date, required: true },
  weights: [weightSchema],
  vaccinated: { type: Boolean, default: false },
  sold: {
    status: { type: Boolean, default: false },
    weight: Number,
    price: Number,
    date: Date
  }
});

module.exports = mongoose.model('Calf', calfSchema);
