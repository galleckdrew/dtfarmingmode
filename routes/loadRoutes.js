const express = require('express');
const router = express.Router();
const Load = require('../models/Load');
const Fuel = require('../models/Fuel');
const Transfer = require('../models/Transfer');
const Tractor = require('../models/Tractor');
const Field = require('../models/Field');
const Farm = require('../models/Farm');
const Pit = require('../models/Pit');
const Pump = require('../models/Pump');
const Trailer = require('../models/Trailer');
const Sand = require('../models/Sand');
const Farmer = require('../models/Farmer');
const TrackedStartHour = require('../models/TrackedStartHour');

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

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate('tractor farm field pit');

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const loadsToday = await Load.find({ timestamp: { $gte: startOfDay } });
    const totalGallons = loadsToday.reduce((sum, l) => sum + (l.gallons || 0), 0);

    const fuelToday = await Fuel.find({ timestamp: { $gte: startOfDay } });
    const totalFuel = fuelToday.reduce((sum, f) => sum + (f.gallons || 0), 0);

    const trackedDocs = await TrackedStartHour.find();
    const trackedHours = {};
    trackedDocs.forEach(doc => {
      trackedHours[`${doc.tractor}_${doc.farm}`] = doc.startHour;
    });

    const loads = await Load.find().sort({ timestamp: -1 }).limit(30).populate('tractor farm field pit');
    const recentLoadsByField = {};
    loads.forEach(load => {
      const fieldName = load.field?.name || 'Unknown Field';
      if (!recentLoadsByField[fieldName]) recentLoadsByField[fieldName] = [];
      recentLoadsByField[fieldName].push(load);
    });

    const recentFuel = await Fuel.find().sort({ timestamp: -1 }).limit(15).populate('tractor field farm');

    // ✅ Append recent fuel entries into recentLoadsByField
    recentFuel.forEach(fuel => {
      const fieldName = fuel.field?.name || 'Unknown Field';
      if (!recentLoadsByField[fieldName]) recentLoadsByField[fieldName] = [];
      recentLoadsByField[fieldName].push({ ...fuel.toObject(), isFuel: true });
    });

    res.render('submit-load', {
      tractors, farms, fields, pits, pumps, trailers, sands, farmers,
      lastLoad, totalGallons, totalFuel,
      trackedHours, recentLoadsByField, recentFuel
    });
  } catch (err) {
    console.error('❌ Failed to load submit page:', err);
    res.status(500).send('Server Error');
  }
});

// ✅ POST Submit End Hour Only
router.post('/submit-end-hour', async (req, res) => {
  try {
    const { tractor, farm, field, pit, endHour } = req.body;

    if (!tractor || !farm || !field || !pit || !endHour) {
      throw new Error("Missing required fields for end hour submission.");
    }

    const keyInfo = { tractor, farm };
    const tracked = await TrackedStartHour.findOne(keyInfo);

    if (!tracked) {
      throw new Error("⚠️ No start hour found for this tractor and farm. Please submit a start hour first.");
    }

    const usedStartHour = tracked.startHour;
    const usedEndHour = parseFloat(endHour);
    const totalHours = usedEndHour - usedStartHour;

    const gallons = 0; // No additional gallons for end hour submission only

    const newLoad = new Load({
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour: usedStartHour,
      endHour: usedEndHour,
      totalHours,
      timestamp: new Date()
    });

    await newLoad.save();
    await TrackedStartHour.deleteOne(keyInfo);

    res.redirect('/submit-load');
  } catch (err) {
    console.error('❌ Submit End Hour Error:', err.message);
    res.status(400).send(err.message || 'Failed to submit end hour');
  }
});

// ✅ POST Submit Transfer
router.post('/submit-transfer', async (req, res) => {
  try {
    const { tractor, farm, field, pump, farmer, trailer, sand, startHour, endHour } = req.body;

    if (!tractor || !farm) {
      throw new Error('Missing required fields');
    }

    let usedStartHour = startHour ? parseFloat(startHour) : undefined;
    let usedEndHour = endHour ? parseFloat(endHour) : undefined;
    let totalHours;
    const keyInfo = { tractor, farm };

    if (usedStartHour !== undefined && !isNaN(usedStartHour)) {
      await TrackedStartHour.findOneAndUpdate(
        keyInfo,
        { startHour: usedStartHour, timestamp: new Date() },
        { upsert: true }
      );
    }

    if (usedEndHour !== undefined && !isNaN(usedEndHour)) {
      const tracked = await TrackedStartHour.findOne(keyInfo);
      if (!tracked) {
        throw new Error('❌ No start hour found for this tractor and farm.');
      }

      usedStartHour = tracked.startHour;
      totalHours = usedEndHour - usedStartHour;
      await TrackedStartHour.deleteOne(keyInfo);
    }

    const newTransfer = new Transfer({
      tractor,
      farm,
      field,
      pump,
      farmer,
      trailer,
      sand,
      startHour: usedStartHour,
      endHour: usedEndHour,
      totalHours,
      timestamp: new Date()
    });

    await newTransfer.save();
    res.redirect('/submit-load');
  } catch (err) {
    console.error('❌ Failed to submit transfer:', err.message);
    res.status(400).send(err.message || 'Failed to submit transfer');
  }
});

// ✅ POST Submit Fuel
router.post('/submit-fuel', async (req, res) => {
  try {
    const { tractor, field, farm, gallons } = req.body;

    if (!tractor || !field || !farm || gallons === undefined || isNaN(parseFloat(gallons)) || parseFloat(gallons) <= 0) {
      throw new Error('Invalid fuel input');
    }

    const newFuel = new Fuel({
      tractor,
      field,
      farm,
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

// ✅ DELETE Fuel
router.post('/delete-fuel/:id', async (req, res) => {
  try {
    await Fuel.findByIdAndDelete(req.params.id);
    res.redirect('/submit-load');
  } catch (err) {
    console.error('❌ Failed to delete fuel:', err);
    res.status(400).send('Failed to delete fuel');
  }
});

module.exports = router;
