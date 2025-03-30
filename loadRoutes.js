const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const moment = require("moment");

// POST /load
router.post("/", async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour, endHour } = req.body;

    const tractorDoc = await Tractor.findById(tractor);
    if (!tractorDoc) return res.status(404).json({ error: "❌ Tractor not found" });

    const gallons = tractorDoc.gallons;
    const totalHours = endHour && startHour ? endHour - startHour : 0;
    const timestamp = new Date();

    const newLoad = new Load({
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour,
      endHour,
      totalHours,
      timestamp
    });

    await newLoad.save();
    res.redirect("/submit-load");
  } catch (error) {
    console.error("❌ Error submitting load:", error);
    res.status(500).json({ error: "❌ Failed to submit load" });
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
