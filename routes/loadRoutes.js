const express = require("express");
const router = express.Router();
const moment = require("moment");
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Transfer = require("../models/Transfer");
const Tractor = require("../models/Tractor");
const Farm = require("../models/Farm");
const Field = require("../models/Field");
const Pit = require("../models/Pit");
const Pump = require("../models/Pump");
const Farmer = require("../models/Farmer");
const Trailer = require("../models/Trailer");
const Sand = require("../models/Sand");
const tractorFarmStartHours = require("../trackedHours");

// GET /submit-load
router.get("/submit-load", async (req, res) => {
  try {
    const [tractors, farms, fields, pits, pumps, farmers, trailers, sands] = await Promise.all([
      Tractor.find(),
      Farm.find(),
      Field.find(),
      Pit.find(),
      Pump.find(),
      Farmer.find(),
      Trailer.find(),
      Sand.find()
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const loadsToday = await Load.find({ timestamp: { $gte: todayStart, $lte: todayEnd } });
    const fuelsToday = await Fuel.find({ timestamp: { $gte: todayStart, $lte: todayEnd } });

    const totalGallons = loadsToday.reduce((sum, l) => sum + (l.gallons || 0), 0);
    const totalFuel = fuelsToday.reduce((sum, f) => sum + (f.amount || 0), 0);

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate("tractor farm field") || null;

    res.render("load-form", {
      tractors,
      farms,
      fields,
      pits,
      pumps,
      farmers,
      trailers,
      sands,
      totalGallons,
      totalFuel,
      trackedHours: tractorFarmStartHours,
      lastLoad,
      selectedTractorId: lastLoad?.tractor?._id?.toString() || '',
      selectedFarmId: lastLoad?.farm?._id?.toString() || '',
      selectedFieldId: lastLoad?.field?._id?.toString() || ''
    });
  } catch (err) {
    console.error("Error loading /submit-load page:", err);
    res.status(500).send("Server error");
  }
});

// POST /load
router.post("/", async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour, endHour } = req.body;
    const tractorData = await Tractor.findById(tractor);
    const farmData = await Farm.findById(farm);
    if (!tractorData || !farmData) return res.status(404).send("Tractor or Farm not found");

    const gallons = tractorData.gallons;
    const timestamp = new Date();
    const key = `${tractor}_${farm}`;
    const readableKey = `${tractorData.name} (${gallons} gal) – ${farmData.name}`;

    let start = startHour ? parseFloat(startHour.replace(',', '.')) : tractorFarmStartHours[key];
    let end = endHour ? parseFloat(endHour.replace(',', '.')) : null;
    let totalHours = null;

    if ((start === undefined || isNaN(start)) && !tractorFarmStartHours[key]) {
      return res.send(`<script>alert('Please enter a start hour for this tractor before using this farm.'); window.location.href='/submit-load';</script>`);
    }

    if (startHour) {
      tractorFarmStartHours[key] = Number(startHour);
      tractorFarmStartHours[readableKey] = Number(startHour);
    }

    if (start !== null && end !== null && !isNaN(start) && !isNaN(end)) {
      totalHours = end >= start ? end - start : 24 - start + end;
      totalHours = Math.round(totalHours * 100) / 100;
      delete tractorFarmStartHours[key];
      delete tractorFarmStartHours[readableKey];
    }

    const load = new Load({
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour: !isNaN(start) ? start : undefined,
      endHour: !isNaN(end) ? end : undefined,
      totalHours,
      timestamp
    });

    await load.save();
    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head><body><h2>✅ Load submitted successfully!</h2><p>Redirecting in 5 seconds...</p></body></html>`);
  } catch (err) {
    console.error("Error submitting load:", err);
    res.status(500).send("Failed to submit load");
  }
});

// POST /submit-end-hour
router.post("/submit-end-hour", async (req, res) => {
  try {
    const { endHour } = req.body;
    const key = Object.keys(tractorFarmStartHours)[0];
    const startHour = tractorFarmStartHours[key];
    if (!startHour || isNaN(startHour)) {
      return res.send(`<script>alert('No tracked start hour found.'); window.location.href='/submit-load';</script>`);
    }

    const end = parseFloat(endHour.replace(',', '.'));
    const totalHours = Math.round((end >= startHour ? end - startHour : 24 - startHour + end) * 100) / 100;

    const [tractorId, farmId] = key.split("_");
    await Load.create({
      tractor: tractorId,
      farm: farmId,
      startHour,
      endHour: end,
      totalHours,
      timestamp: new Date()
    });

    delete tractorFarmStartHours[key];
    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head><body><h2>✅ End hour submitted!</h2><p>Redirecting in 5 seconds...</p></body></html>`);
  } catch (err) {
    console.error("Error submitting end hour:", err);
    res.status(500).send("Failed to submit end hour");
  }
});

// POST /submit-fuel
router.post("/submit-fuel", async (req, res) => {
  const { tractor, field, amount, farm } = req.body;
  try {
    const newFuel = new Fuel({
      tractor,
      field,
      amount,
      farm,
      timestamp: new Date()
    });
    await newFuel.save();
    res.redirect("/submit-load");
  } catch (err) {
    console.error("❌ Failed to submit fuel:", err);
    res.status(500).send("Error submitting fuel data.");
  }
});

// POST /submit-transfer
router.post("/submit-transfer", async (req, res) => {
  try {
    const { tractor, pump, farmer, trailer, sand, field, startHour, endHour } = req.body;

    const start = parseFloat(startHour.replace(',', '.'));
    const end = parseFloat(endHour.replace(',', '.'));
    if (isNaN(start) || isNaN(end)) {
      return res.send(`<script>alert('Invalid start or end hour'); window.location.href = '/submit-load';</script>`);
    }

    const totalHours = Math.round((end >= start ? end - start : 24 - start + end) * 100) / 100;

    await Transfer.create({
      tractor,
      pump,
      farmer,
      trailer,
      sand,
      field,
      startHour: start,
      endHour: end,
      totalHours,
      timestamp: new Date()
    });

    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head><body><h2>✅ Transfer hours submitted!</h2><p>Redirecting in 5 seconds...</p></body></html>`);
  } catch (err) {
    console.error("Error submitting transfer:", err);
    res.status(500).send("Failed to submit transfer hours");
  }
});

module.exports = router;
