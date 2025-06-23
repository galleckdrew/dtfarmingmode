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
      Tractor.find(), Farm.find(), Field.find(), Pit.find(), Pump.find(), Farmer.find(), Trailer.find(), Sand.find()
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
    const totalFuel = fuelsToday.reduce((sum, fuel) => sum + (fuel.gallons || 0), 0);

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate("tractor farm field") || null;

    res.render("submit-load", {
      tractors, farms, fields, pits, pumps, farmers, trailers, sands,
      totalGallons, totalFuel,
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

// POST /submit-fuel
router.post("/submit-fuel", async (req, res) => {
  const { tractor, field, amount, farm } = req.body;
  try {
    const parsedGallons = parseFloat(amount);
    if (isNaN(parsedGallons)) throw new Error("Invalid fuel amount");

    await Fuel.create({
      tractor,
      field,
      gallons: parsedGallons,
      farm,
      timestamp: new Date()
    });
    res.redirect("/submit-load");
  } catch (err) {
    console.error("\u274C Failed to submit fuel:", err);
    res.status(500).send("Error submitting fuel data.");
  }
});

// Export the router
module.exports = router;
