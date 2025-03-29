const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

router.get("/driver-history", async (req, res) => {
  try {
    const { tractor, field, farm } = req.query;

    const filters = {};
    if (tractor) filters.tractor = tractor;
    if (field) filters.field = field;
    if (farm) filters.farm = farm;

    const loads = await Load.find(filters)
      .populate("tractor")
      .populate("farm")
      .populate("field")
      .populate("pit")
      .sort({ createdAt: -1 });

    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();

    const totalGallons = loads.reduce((sum, load) => sum + (load.gallons || 0), 0);
    const totalLoads = loads.length;

    // Group by date
    const grouped = {};
    loads.forEach(load => {
      const date = new Date(load.createdAt).toLocaleDateString();
      if (!grouped[date]) grouped[date] = { gallons: 0, loads: 0 };
      grouped[date].gallons += load.gallons || 0;
      grouped[date].loads += 1;
    });

    res.render("driver-history", {
      loads,
      grouped,
      totalGallons,
      totalLoads,
      tractors,
      farms,
      fields,
      selected: { tractor, farm, field }
    });
  } catch (err) {
    console.error("❌ Error in driver-history:", err);
    res.status(500).send("❌ Error loading driver history.");
  }
});

module.exports = router;
