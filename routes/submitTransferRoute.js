
const express = require("express");
const router = express.Router();
const Transfer = require("../models/Transfer");

router.post("/submit-transfer", async (req, res) => {
  try {
    const { tractor, pump, farmer, trailer, sand, field, startHour, endHour } = req.body;

    // Log inputs for debugging
    console.log("Received Transfer Data:", {
      tractor, pump, farmer, trailer, sand, field, startHour, endHour
    });

    // Basic presence check
    if (!startHour || !endHour) {
      return res.send(`<script>alert('Please fill in both start and end hour fields.'); window.location.href = '/submit-load';</script>`);
    }

    // Parse hours safely
    const start = parseFloat(startHour.replace(',', '.'));
    const end = parseFloat(endHour.replace(',', '.'));

    if (isNaN(start) || isNaN(end)) {
      return res.send(`<script>alert('Invalid number format for start or end hour'); window.location.href = '/submit-load';</script>`);
    }

    // Calculate total hours, accounting for midnight rollover
    const totalHours = Math.round((end >= start ? end - start : 24 - start + end) * 100) / 100;

    // Save transfer to DB
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
