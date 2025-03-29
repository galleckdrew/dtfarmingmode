

const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const moment = require("moment");

// ✅ POST /load - Submit load
router.post("/", async (req, res) => {
  try {
    const { tractor, location, gallons, startHour, endHour } = req.body;

    const totalHours = endHour - startHour;
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");

    const newLoad = new Load({
      tractor,
      location,
      gallons,
      startHour,
      endHour,
      totalHours,
      timestamp
    });

    await newLoad.save();
    res.json({ message: "✅ Load submitted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Failed to submit load" });
  }
});

// ✅ GET /load - All loads + totals
router.get("/", async (req, res) => {
  try {
    const loads = await Load.find()
      .populate("tractor", "name")
      .populate("location", "name")
      .sort({ timestamp: -1 });

    const totalGallons = loads.reduce((sum, load) => sum + load.gallons, 0);

    res.json({
      loads: loads.map(load => ({
        tractor: load.tractor.name,
        location: load.location.name,
        gallons: load.gallons,
        startHour: load.startHour,
        endHour: load.endHour,
        timestamp: load.timestamp
      })),
      totalGallons,
    });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch loads" });
  }
});

// ✅ GET /load/tractor-gallons/:id - Get tractor default gallons
router.get("/tractor-gallons/:id", async (req, res) => {
  try {
    const tractor = await Tractor.findById(req.params.id);
    if (!tractor) return res.status(404).json({ error: "Tractor not found" });
    res.json({ gallons: tractor.gallons });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

