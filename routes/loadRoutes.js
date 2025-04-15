const express = require("express");
const router = express.Router();
const moment = require("moment");
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Tractor = require("../models/Tractor");
const Farm = require("../models/Farm");
const Field = require("../models/Field");
const Pit = require("../models/Pit");
const tractorFarmStartHours = require("../trackedHours");

// =========================
// GET Load Form
// =========================
router.get("/submit-load", async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();
    const pits = await Pit.find();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const loadsToday = await Load.find({ timestamp: { $gte: todayStart, $lte: todayEnd } });
    const fuelsToday = await Fuel.find({ timestamp: { $gte: todayStart, $lte: todayEnd } });

    const totalGallons = loadsToday.reduce((sum, load) => sum + (load.gallons || 0), 0);
    const totalFuel = fuelsToday.reduce((sum, fuel) => sum + (fuel.amount || 0), 0);

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate("tractor farm field");

    res.render("load-form", {
      tractors,
      farms,
      fields,
      pits,
      totalGallons,
      totalFuel,
      trackedHours: tractorFarmStartHours,
      lastLoad,
      selectedTractorId: lastLoad?.tractor?._id?.toString() || '',
      selectedFarmId: lastLoad?.farm?._id?.toString() || '',
      selectedFieldId: lastLoad?.field?._id?.toString() || ''
    });
  } catch (error) {
    console.error("❌ Error loading submit-load form:", error);
    res.status(500).send("Server Error");
  }
});

// =========================
// POST Load
// =========================
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
      return res.send(`<script>alert('⚠️ Please enter a start hour for this tractor before using this farm.');
        window.location.href = '/submit-load';</script>`);
    }

    if (startHour) {
      tractorFarmStartHours[key] = Number(startHour);
      tractorFarmStartHours[readableKey] = Number(startHour);
    }

    if (start !== null && end !== null && !isNaN(start) && !isNaN(end)) {
      totalHours = end >= start ? end - start : (24 - start + end);
      totalHours = Math.round(totalHours * 100) / 100;
      delete tractorFarmStartHours[key];
      delete tractorFarmStartHours[readableKey];
    }

    const loadData = {
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour: !isNaN(start) ? start : undefined,
      timestamp
    };

    if (end !== null && !isNaN(end)) loadData.endHour = end;
    if (totalHours !== null && !isNaN(totalHours)) loadData.totalHours = totalHours;

    await new Load(loadData).save();

    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head>
      <body><h2>✅ Load submitted successfully!</h2><p>Redirecting to the load form in 5 seconds...</p></body></html>`);
  } catch (error) {
    console.error("❌ Error submitting load:", error);
    res.status(500).send("❌ Failed to submit load");
  }
});

// =========================
// POST End Hour
// =========================
router.post("/submit-end-hour", async (req, res) => {
  try {
    const { tractor, farm, field, endHour } = req.body;
    const key = `${tractor}_${farm}`;
    const startHour = tractorFarmStartHours[key];

    if (!startHour || isNaN(startHour)) {
      return res.send(`<script>alert('⚠️ No start hour found for this tractor and farm. Please submit a start hour first.');
        window.location.href = '/submit-load';</script>`);
    }

    const end = parseFloat(endHour.replace(',', '.'));
    const totalHours = Math.round((end >= startHour ? end - startHour : (24 - startHour + end)) * 100) / 100;

    await new Load({
      tractor,
      farm,
      field,
      startHour,
      endHour: end,
      totalHours,
      timestamp: new Date(),
    }).save();

    delete tractorFarmStartHours[key];

    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head>
      <body><h2>✅ End hour submitted successfully!</h2><p>Redirecting to the load form in 5 seconds...</p></body></html>`);
  } catch (error) {
    console.error("❌ Error in /submit-end-hour:", error);
    res.status(500).send("❌ Failed to submit end hour");
  }
});

// =========================
// POST Fuel
// =========================
router.post("/submit-fuel", async (req, res) => {
  try {
    const { tractor, field, amount } = req.body;
    await Fuel.create({ tractor, field, amount });
    res.redirect("/submit-load");
  } catch (error) {
    console.error("❌ Error submitting fuel:", error);
    res.status(500).send("❌ Failed to submit fuel");
  }
});

// =========================
// GET Fuel History
// =========================
router.get("/fuel-history", async (req, res) => {
  try {
    const { from, to, tractor, field } = req.query;
    const query = {};

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = toDate;
      }
    }

    if (tractor) query.tractor = tractor;
    if (field) query.field = field;

    const fuels = await Fuel.find(query).populate("tractor field").sort({ timestamp: -1 });
    const totalFuel = fuels.reduce((sum, fuel) => sum + (fuel.amount || 0), 0);

    const tractors = await Tractor.find();
    const fields = await Field.find();

    res.render("fuel-history", {
      fuels,
      tractors,
      fields,
      totalFuel,
      from,
      to,
      selectedTractor: tractor,
      selectedField: field
    });
  } catch (error) {
    console.error("❌ Error loading fuel history:", error);
    res.status(500).send("❌ Failed to load fuel history");
  }
});

module.exports = router;
