// routes/loadRoutes.js
const express = require('express');
const router = express.Router();
const Fuel = require('../models/Fuel');
const Load = require('../models/Load');
const Transfer = require('../models/Transfer');
const Tractor = require('../models/Tractor');
const Field = require('../models/Field');
const Farm = require('../models/Farm');
const Pit = require('../models/Pit');
const Pump = require('../models/Pump');
const Trailer = require('../models/Trailer');
const Sand = require('../models/Sand');
const Farmer = require('../models/Farmer');

// Submit Fuel
router.post('/submit-fuel', async (req, res) => {
  try {
    const { tractor, field, gallons } = req.body;

    if (!tractor || !field || gallons === undefined || isNaN(parseFloat(gallons)) || parseFloat(gallons) <= 0) {
      throw new Error('Invalid fuel amount');
    }

    const newFuel = new Fuel({
      tractor,
      field,
      gallons: parseFloat(gallons),
      timestamp: new Date()
    });

    await newFuel.save();
    res.redirect('/submit-load');
  } catch (err) {
    console.error('❌ Failed to submit fuel:', err);
    res.status(400).send('Failed to submit fuel');
  }
});

module.exports = router;
