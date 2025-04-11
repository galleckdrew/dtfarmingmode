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
  const { from, to, tractor, farm, field } = req.query;
  let query = {};

  if (from || to) {
    query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(from + "T00:00:00");
    if (to) query.timestamp.$lte = new Date(to + "T23:59:59");
  }

  if (tractor) query.tractor = tractor;
  if (farm) query.farm = farm;
  if (field) query.field = field;

  const loads = await Load.find(query)
    .populate("tractor farm field pit")
    .sort({ timestamp: -1 });

  const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);
  const tractors = await Tractor.find();
  const farms = await Farm.find();
  const fields = await Field.find();

  res.render("driver-history", {
    loads,
    tractors,
    farms,
    fields,
    totalGallons,
  });
});

// Edit load form
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
  const { tractor, farm, field, pit, startHour, endHour } = req.body;
  const tractorData = await Tractor.findById(tractor);
  const gallons = tractorData?.gallons || 0;
  const totalHours = (startHour && endHour) ? endHour - startHour : null;

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
});

// Delete load
router.delete("/driver-history/:id", async (req, res) => {
  await Load.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

module.exports = router;
