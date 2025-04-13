const express = require("express");
const router = express.Router();
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// Memory tracking (shared from loadRoutes)
const { tractorFarmStartHours } = require("./loadRoutes");

// Load Admin Form
router.get("/form", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("❌ Error loading admin form:", error);
    res.status(500).send("Error loading admin panel");
  }
});

// --------------------
// TRACTORS
// --------------------
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

// --------------------
// FARMS
// --------------------
router.post("/farms", async (req, res) => {
  const { name } = req.body;
  await Farm.create({ name });
  res.redirect("/admin/form");
});

router.put("/farms/:id", async (req, res) => {
  const { name } = req.body;
  await Farm.findByIdAndUpdate(req.params.id, { name });
  res.redirect("/admin/form");
});

router.delete("/farms/:id", async (req, res) => {
  await Farm.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// --------------------
// FIELDS
// --------------------
router.post("/fields", async (req, res) => {
  const { name } = req.body;
  await Field.create({ name });
  res.redirect("/admin/form");
});

router.put("/fields/:id", async (req, res) => {
  const { name } = req.body;
  await Field.findByIdAndUpdate(req.params.id, { name });
  res.redirect("/admin/form");
});

router.delete("/fields/:id", async (req, res) => {
  await Field.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// --------------------
// PITS
// --------------------
router.post("/pits", async (req, res) => {
  const { name } = req.body;
  await Pit.create({ name });
  res.redirect("/admin/form");
});

router.put("/pits/:id", async (req, res) => {
  const { name } = req.body;
  await Pit.findByIdAndUpdate(req.params.id, { name });
  res.redirect("/admin/form");
});

router.delete("/pits/:id", async (req, res) => {
  await Pit.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// --------------------
// TRACKING RESET
// --------------------
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

module.exports = router;
