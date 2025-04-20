const express = require("express");
const router = express.Router();
const Transfer = require("../models/Transfer");

router.post("/submit-transfer", async (req, res) => {
  try {
    let { tractor, pump, farmer, trailer, sand, field, startHour, endHour } = req.body;

    // Convert empty strings to null for optional ObjectId fields
    const clean = (val) => val === '' ? null : val;

    const start = startHour ? parseFloat(startHour.replace(',', '.')) : NaN;
    const end = endHour ? parseFloat(endHour.replace(',', '.')) : NaN;

    if (isNaN(start)) {
      return res.send(`<script>alert('Start hour is required'); window.location.href = '/submit-load';</script>`);
    }

    let totalHours = null;
    if (!isNaN(end)) {
      totalHours = Math.round((end >= start ? end - start : 24 - start + end) * 100) / 100;
    }

    await Transfer.create({
      tractor,
      pump: clean(pump),
      farmer: clean(farmer),
      trailer: clean(trailer),
      sand: clean(sand),
      field: clean(field),
      startHour: start,
      endHour: !isNaN(end) ? end : undefined,
      totalHours,
      timestamp: new Date()
    });

    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head><body><h2>✅ Transfer submitted successfully!</h2><p>Redirecting in 5 seconds...</p></body></html>`);
  } catch (err) {
    console.error("❌ Error submitting transfer:", err);
    res.status(500).send("Failed to submit transfer.");
  }
});

module.exports = router;

