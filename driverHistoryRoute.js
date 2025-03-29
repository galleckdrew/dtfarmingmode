// driverHistoryRoutes.js
const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

router.get("/driver-history", async (req, res) => {
  try {
    const loads = await Load.find().sort({ createdAt: -1 }).populate("tractor farm field pit");

    const totalGallons = loads.reduce((sum, load) => sum + (load.gallons || 0), 0);

    res.render("driver-history", {
      loads,
      totalGallons
    });
  } catch (err) {
    res.status(500).send("Error loading driver history.");
  }
});

module.exports = router;
