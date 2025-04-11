const express = require("express");
const router = express.Router();
const methodOverride = require("method-override");
router.use(methodOverride("_method"));

const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// View history with filters
router.get("/driver-history", async (req, res) => {
  const { date, tractor, farm, field } = req.query;

  let query = {};
  if (date) {
    const start = new Date(date + "T00:00:00");
    const end = new Date(date + "T23:59:59");
    query.timestamp = { $gte: start, $lte: end };
  }
  if (tractor) query.tractor = tractor;
  if (farm) query.farm = farm;
  if (field) query.field = field;

  const loads = await Load.find(query)
    .populate("tractor farm field pit")
    .sort({ timestamp: -1 });

  const totalLoads = loads.length;
  const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);

  const tractors = await Tractor.find();
  const farms = await Farm.find();
  const fields = await Field.find();

  res.render("driver-history", {
    loads,
    totalLoads,
    totalGallons,
    tractors,
    farms,
    fields,
  });
});

// Edit form
router.get("/driver-history/:id/edit", async (req, res) => {
  const load = await Load.findById(req.params.id);
  const tractors = await Tractor.find();
  const farms = await Farm.find();
  const fields = await Field.find();
  const pits = await Pit.find();

  res.render("edit-load", { load, tractors, farms, fields, pits });
});

// Update load
router.put("/driver-history/:id", async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour, endHour } = req.body;
    const tractorData = await Tractor.findById(tractor);

    const gallons = tractorData?.gallons || 0;
    const totalHours = startHour && endHour ? endHour - startHour : null;

    await Load.findByIdAndUpdate(req.params.id, {
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour,
      endHour,
      totalHours,
    });

    res.redirect("/driver-history");
  } catch (err) {
    console.error("❌ Update failed:", err);
    res.status(500).send("❌ Failed to update load.");
  }
});

// Delete load
router.delete("/driver-history/:id", async (req, res) => {
  try {
    await Load.findByIdAndDelete(req.params.id);
    res.redirect("/driver-history");
  } catch (err) {
    res.status(500).send("❌ Failed to delete load.");
  }
});

module.exports = router;
