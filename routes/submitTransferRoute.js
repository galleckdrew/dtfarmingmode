const express = require("express");
const router = express.Router();
const Transfer = require("../models/Transfer");

router.post("/submit-transfer", async (req, res) => {
  try {
    const { tractor, pump, farmer, trailer, sand, field, startHour, endHour } = req.body;

    const start = startHour ? parseFloat(startHour.replace(',', '.')) : NaN;
    const end = endHour ? parseFloat(endHour.replace(',', '.')) : null;

    if (isNaN(start)) {
      return res.send(`<script>alert('Please enter a valid Start Hour'); window.location.href = '/submit-load';</script>`);
    }

    let totalHours = null;
    if (end !== null && !isNaN(end)) {
      totalHours = end >= start ? end - start : 24 - start + end;
      totalHours = Math.round(totalHours * 100) / 100;
    }

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

    res.send(`<html><head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head><body><h2>✅ Transfer submitted successfully!</h2><p>Redirecting in 5 seconds...</p></body></html>`);
  } catch (err) {
    console.error("❌ Error submitting transfer:", err);
    res.status(500).send("Failed to submit transfer.");
  }
});

module.exports = router;
