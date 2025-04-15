const express = require("express");
const router = express.Router();
const moment = require("moment");
const Load = require("./models/Load");
const Fuel = require("./models/Fuel");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const tractorFarmStartHours = require("./trackedHours");

// =========================
// GET Load Form (submit-load)
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

    const loadsToday = await Load.find({
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });

    const fuelsToday = await Fuel.find({
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });

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
// REST OF LOAD ROUTES BELOW
// =========================
// Keep your load POST, end-hour, and history handlers here without changes

module.exports = router;
