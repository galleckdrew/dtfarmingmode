const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const moment = require("moment");

// POST /load
router.post("/", async (req, res) => {
  try {
    const { tractor, gallons, farm, field, pit, startHour, endHour } = req.body;

    const totalHours = endHour && startHour ? Number(endHour) - Number(startHour) : null;
    const timestamp = moment().toISOString();

    const newLoad = new Load({
      tractor,
      gallons,
      farm,
      field,
      pit,
      startHour,
      endHour,
      totalHours,
      timestamp,
    });

    await newLoad.save();
    res.redirect("/submit-load");
  } catch (error) {
    console.error("❌ Failed to submit load:", error);
    res.status(500).send("❌ Failed to submit load");
  }
});

// (Optional) GET all loads + totals (can be removed or adjusted)
router.get("/", async (req, res) => {
  try {
    const loads = await Load.find()
      .populate("tractor farm field pit")
      .sort({ timestamp: -1 });

    const totalGallons = loads.reduce((sum, load) => sum + (load.gallons || 0), 0);

    res.json({ loads, totalGallons });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch loads" });
  }
});

module.exports = router;
