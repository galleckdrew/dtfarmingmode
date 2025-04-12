const express = require("express");
const router = express.Router();
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// ⏱️ Memory for tracked start hours
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

// ✅ Reset a specific tracking key
router.post("/reset-tracking", (req, res) => {
  const key = req.body.key;
  if (key && tractorFarmStartHours[key]) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

// ✅ Reset all tracking
router.post("/reset-all-tracking", (req, res) => {
  for (const key in tractorFarmStartHours) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

module.exports = router;
