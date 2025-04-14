const express = require("express");
const router = express.Router();
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

const { tractorFarmStartHours } = require("./loadRoutes");

// Admin Form
router.get("/form", async (req, res) => {
  const tractors = await Tractor.find();
  const farms = await Farm.find();
  const fields = await Field.find();
  const pits = await Pit.find();

  res.render("admin-form", {
    tractors,
    farms,
    fields,
    pits,
    trackedStartHours: tractorFarmStartHours,
  });
});

// TRACTORS
router.post("/tractors", async (req, res) => {
  const { name, gallons } = req.body;
  await Tractor.create({ name, gallons });
  res.redirect("/admin/form");
});

router.put("/tractors/:id", async (req, res) => {
  const { name, gallons } = req.body;
  await Tractor.findByIdAndUpdate(req.params.id, { name, gallons });
  res.redirect("/admin/form");
});

router.delete("/tractors/:id", async (req, res) => {
  await Tractor.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// FARMS
router.post("/farms", async (req, res) => {
  await Farm.create({ name: req.body.name });
  res.redirect("/admin/form");
});

router.put("/farms/:id", async (req, res) => {
  await Farm.findByIdAndUpdate(req.params.id, { name: req.body.name });
  res.redirect("/admin/form");
});

router.delete("/farms/:id", async (req, res) => {
  await Farm.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// FIELDS
router.post("/fields", async (req, res) => {
  await Field.create({ name: req.body.name });
  res.redirect("/admin/form");
});

router.put("/fields/:id", async (req, res) => {
  await Field.findByIdAndUpdate(req.params.id, { name: req.body.name });
  res.redirect("/admin/form");
});

router.delete("/fields/:id", async (req, res) => {
  await Field.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// PITS
router.post("/pits", async (req, res) => {
  await Pit.create({ name: req.body.name });
  res.redirect("/admin/form");
});

router.put("/pits/:id", async (req, res) => {
  await Pit.findByIdAndUpdate(req.params.id, { name: req.body.name });
  res.redirect("/admin/form");
});

router.delete("/pits/:id", async (req, res) => {
  await Pit.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// TRACKING RESET
router.post("/reset-tracking", (req, res) => {
  const key = req.body.key;
  if (key && tractorFarmStartHours[key]) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

router.post("/reset-all-tracking", (req, res) => {
  for (const key in tractorFarmStartHours) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

// ✅ FIX: Add this line to EXPORT the router!
module.exports = router;
