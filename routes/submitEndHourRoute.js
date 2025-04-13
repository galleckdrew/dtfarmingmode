const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Tractor = require("../models/Tractor");
const tractorFarmStartHours = require("../trackedHours");

// 🚜 Submit End Hour Only
router.post("/submit-end-hour", async (req, res) => {
  try {
    const { endHour } = req.body;
    const end = parseFloat(endHour.replace(',', '.'));

    if (isNaN(end)) {
      return res.send(`<script>alert('❌ Invalid end hour'); window.location.href = '/submit-load';</script>`);
    }

    const keys = Object.keys(tractorFarmStartHours);
    if (keys.length === 0) {
      return res.send(`<script>alert('⚠️ No start hour found. Please submit a start hour first.'); window.location.href = '/submit-load';</script>`);
    }

    const latestKey = keys[keys.length - 1];
    const [tractor, farm] = latestKey.split("_");
    const startHour = tractorFarmStartHours[latestKey];

    // Find most recent load with same tractor & farm to reuse field and pit
    const lastLoad = await Load.findOne({ tractor, farm }).sort({ timestamp: -1 });

    if (!lastLoad || !lastLoad.field || !lastLoad.pit) {
      return res.send(`<script>alert('❌ Missing previous field or pit info. Submit full load first.'); window.location.href = '/submit-load';</script>`);
    }

    let totalHours = end >= startHour ? end - startHour : (24 - startHour + end);
    totalHours = Math.round(totalHours * 100) / 100;

    const tractorData = await Tractor.findById(tractor);
    const gallons = tractorData?.gallons || 0;

    const newLoad = new Load({
      tractor,
      farm,
      field: lastLoad.field,
      pit: lastLoad.pit,
      startHour,
      endHour: end,
      totalHours,
      gallons,
      timestamp: new Date(),
    });

    await newLoad.save();
    delete tractorFarmStartHours[latestKey];

    res.send(`
      <html>
        <head><meta http-equiv="refresh" content="4; URL=/submit-load" /></head>
        <body><h2>✅ End hour submitted successfully!</h2><p>Redirecting to the load form in 4 seconds...</p></body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error in /submit-end-hour:", error);
    res.status(500).send("❌ Failed to submit end hour");
  }
});

module.exports = router;
