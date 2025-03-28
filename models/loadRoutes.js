const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Location = require("./models/Location");

router.post("/submit", async (req, res) => {
  try {
    const {
      tractor,
      location,
      gallons,
      startHours,
      endHours,
      dateTime
    } = req.body;

    const totalHours = endHours - startHours;
    const load = new Load({
      tractor,
      location,
      gallons,
      startHours,
      endHours,
      totalHours,
      dateTime
    });

    await load.save();
    res.json({ message: "✅ Load submitted successfully!", totalHours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to submit load" });
  }
});

module.exports = router;

const loadRoutes = require("./loadRoutes");
app.use("/load", loadRoutes);
// View all submitted loads
router.get("/", async (req, res) => {
  try {
    const loads = await Load.find()
      .populate("tractor", "name")
      .populate("location", "name")
      .sort({ timestamp: -1 });

    const totalGallons = loads.reduce((sum, load) => sum + load.gallons, 0);

    res.json({
      loads,
      totalGallons
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to fetch loads" });
  }
});


