
// routes/loadRoutes.js
const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Transfer = require("../models/Transfer");
const Tractor = require("../models/Tractor");
const Farm = require("../models/Farm");
const Field = require("../models/Field");
const Pit = require("../models/Pit");

// POST transfer hours
router.post("/submit-transfer", async (req, res) => {
  try {
    const { tractor, pump, farmer, startHour, endHour } = req.body;
    const start = parseFloat(startHour);
    const end = parseFloat(endHour);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).send("Invalid hour inputs");
    }
    const totalHours = end >= start ? end - start : 24 - start + end;

    await Transfer.create({
      tractor,
      pump,
      farmer,
      startHour: start,
      endHour: end,
      totalHours,
      timestamp: new Date()
    });

    res.redirect("/submit-load");
  } catch (err) {
    console.error("❌ Error submitting transfer hours:", err);
    res.status(500).send("❌ Failed to submit transfer hours");
  }
});

module.exports = router;
