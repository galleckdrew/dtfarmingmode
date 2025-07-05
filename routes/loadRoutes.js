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

// ✅ GET Submit Load Page
router.get('/submit-load', async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const fields = await Field.find();
    const farms = await Farm.find();
    const pits = await Pit.find();
    const pumps = await Pump.find();
    const trailers = await Trailer.find();
    const sands = await Sand.find();
    const farmers = await Farmer.find();

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate('tractor');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const loadsToday = await Load.find({ timestamp: { $gte: startOfDay, $lte: endOfDay } });
    const totalGallons = loadsToday.reduce((sum, load) => sum + (load.gallons || 0), 0);

    const fuelsToday = await Fuel.find({ timestamp: { $gte: startOfDay, $lte: endOfDay } });
    const totalFuel = fuelsToday.reduce((sum, f) => sum + (f.gallons || 0), 0);

    // 🆕 Recent loads by most recent 3 fields
    const recentFieldIds = await Load.find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .distinct('field');

    const recentFieldsLimited = recentFieldIds.slice(0, 3);

    const recentLoadsByField = {};

    for (const fieldId of recentFieldsLimited) {
      const field = await Field.findById(fieldId);
      const loads = await Load.find({ field: fieldId })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('tractor farm pit');

      recentLoadsByField[field?.name || 'Unknown Field'] = loads;
    }

    res.render('submit-load', {
      tractors,
      fields,
      farms,
      pits,
      pumps,
      trailers,
      sands,
      farmers,
      lastLoad,
      totalGallons,
      totalFuel,
      selectedTractorId: '',
      selectedFarmId: '',
      trackedHours: {},
      recentLoadsByField // ✅ Pass recent grouped loads
    });
  } catch (err) {
    console.error('❌ Error loading submit-load page:', err);
    res.status(500).send('Failed to load page');
  }
});

// ✅ POST Submit Load
router.post('/load', async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour } = req.body;

    if (!tractor || !farm || !field || !pit) {
      throw new Error('Missing required fields');
    }

    const tractorData = await Tractor.findById(tractor);
    const gallons = tractorData ? tractorData.gallons : 0;

    const newLoad = new Load({
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour: startHour ? parseFloat(startHour) : undefined,
      timestamp: new Date()
    });

    await newLoad.save();
    res.redirect('/submit-load');
  } catch (err) {
    console.error('❌ Failed to submit load:', err);
    res.status(400).send('Failed to submit load');
  }
});

// ✅ POST Submit Fuel
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
