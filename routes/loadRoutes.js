

const express = require("express");
const router = express.Router();
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
const { tractorFarmStartHours, saveTrackedHours } = require("../trackedHoursStore");

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

    const [loadsToday, fuelsToday] = await Promise.all([
      Load.find({ timestamp: { $gte: todayStart, $lte: todayEnd } }),
      Fuel.find({ timestamp: { $gte: todayStart, $lte: todayEnd } })
    ]);

    const totalGallons = loadsToday.reduce((sum, load) => sum + (load.gallons || 0), 0);
    const totalFuel = fuelsToday.reduce((sum, fuel) => sum + (fuel.amount || 0), 0);

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate("tractor farm field") || null;

    res.render("submit-load", {
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
    const key = `${tractor}_${field}`;
    const readableKey = `${tractorData.name} (${gallons} gal) – Field ${field}`;

    let start = startHour ? parseFloat(startHour.replace(',', '.')) : tractorFarmStartHours[key];
    let end = endHour ? parseFloat(endHour.replace(',', '.')) : null;
    let totalHours = null;

    if ((start === undefined || isNaN(start)) && !tractorFarmStartHours[key]) {
      return res.send(`<script>alert('Please enter a start hour for this tractor before using this field.'); window.location.href='/submit-load';</script>`);
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
    const end = parseFloat(endHour.replace(',', '.'));
    if (isNaN(end)) {
      return res.send(`<script>alert('End hour is invalid'); window.location.href='/submit-load';</script>`);
    }

    const keys = Object.keys(tractorFarmStartHours).filter(k => k.includes("_"));
    if (!keys.length) {
      return res.send(`<script>alert('No tracked start hour found.'); window.location.href='/submit-load';</script>`);
    }

    const key = keys[0];
    const start = tractorFarmStartHours[key];
    const [tractorId, fieldId] = key.split("_");

    const totalHours = Math.round((end >= start ? end - start : 24 - start + end) * 100) / 100;

    await Load.create({
      tractor: tractorId,
      field: fieldId,
      startHour: start,
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
    await Fuel.create({
      tractor,
      field,
      amount,
      farm,
      timestamp: new Date()
    });
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
    const end = endHour ? parseFloat(endHour.replace(',', '.')) : null;

    if (isNaN(start)) {
      return res.send(`<script>alert('Start hour is required'); window.location.href='/submit-load';</script>`);
    }

    let totalHours = null;
    if (end !== null && !isNaN(end)) {
      totalHours = Math.round((end >= start ? end - start : 24 - start + end) * 100) / 100;
    }

    await Transfer.create({
      tractor,
      pump: pump || undefined,
      farmer: farmer || undefined,
      trailer: trailer || undefined,
      sand: sand || undefined,
      field: field || undefined,
      startHour: start,
      endHour: !isNaN(end) ? end : undefined,
      totalHours,
      timestamp: new Date()
    });

    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head><body><h2>✅ Transfer submitted successfully!</h2><p>Redirecting in 5 seconds...</p></body></html>`);
  } catch (err) {
    console.error("Error submitting transfer:", err);
    res.status(500).send("Failed to submit transfer hours");
  }
});

// ✅ NEW: POST /edit-load/:id
router.post("/edit-load/:id", async (req, res) => {
  try {
    const { fieldId, timestamp } = req.body;

    await Load.findByIdAndUpdate(req.params.id, {
      field: fieldId,
      timestamp: new Date(timestamp)
    });

    res.redirect("/driver-history");
  } catch (err) {
    console.error("❌ Failed to update load:", err);
    res.status(500).send("Update failed");
  }
});

module.exports = router;
