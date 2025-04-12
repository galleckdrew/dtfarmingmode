const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// View driver history with filters
router.get("/driver-history", async (req, res) => {
  const { from, to, tractor, farm, field } = req.query;

  const filters = {};
  if (from && to) {
    filters.timestamp = {
      $gte: new Date(from + "T00:00:00.000Z"),
      $lte: new Date(to + "T23:59:59.999Z")
    };
  }
  if (tractor) filters.tractor = tractor;
  if (farm) filters.farm = farm;
  if (field) filters.field = field;

  const loads = await Load.find(filters)
    .populate("tractor")
    .populate("farm")
    .populate("field")
    .populate("pit")
    .sort({ timestamp: -1 });

  const tractors = await Tractor.find();
  const farms = await Farm.find();
  const fields = await Field.find();

  const totalLoads = loads.length;
  const totalGallons = loads.reduce((sum, load) => sum + (load.gallons || 0), 0);
  const totalHours = loads.reduce((sum, load) => sum + (load.totalHours || 0), 0);

  res.render("driver-history", {
    loads,
    tractors,
    farms,
    fields,
    totalLoads,
    totalGallons,
    totalHours,
    from,
    to,
    tractor,
    farm,
    field
  });
});

// Show edit form
router.get("/driver-history/:id/edit", async (req, res) => {
  const load = await Load.findById(req.params.id);
  const tractors = await Tractor.find();
  const farms = await Farm.find();
  const fields = await Field.find();
  const pits = await Pit.find();

  res.render("edit-load", {
    load,
    tractors,
    farms,
    fields,
    pits
  });
});

// Handle update
router.put("/driver-history/:id", async (req, res) => {
  const { tractor, farm, field, pit, startHour, endHour } = req.body;

  const start = startHour ? Number(startHour) : null;
  const end = endHour ? Number(endHour) : null;

  let totalHours = null;
  if (start !== null && end !== null) {
    totalHours = end >= start ? end - start : (24 - start + end);
    totalHours = Math.round(totalHours * 100) / 100;
  }

  await Load.findByIdAndUpdate(
    req.params.id,
    {
      tractor,
      farm,
      field,
      pit,
      startHour: start,
      endHour: end,
      totalHours
    },
    { new: true }
  );

  res.redirect("/driver-history");
});

// Handle delete
router.delete("/driver-history/:id", async (req, res) => {
  await Load.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

module.exports = router;
