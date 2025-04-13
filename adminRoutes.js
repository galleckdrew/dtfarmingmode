const express = require("express");
const router = express.Router();
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const { tractorFarmStartHours } = require("./loadRoutes");

// GET Admin Panel
router.get("/form", async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();
    const pits = await Pit.find();

    // Convert trackedHours keys into readable names
    const readableTracked = {};
    for (const key in tractorFarmStartHours) {
      const [tractorId, farmId] = key.split("_");
      const tractor = tractors.find(t => t._id.toString() === tractorId);
      const farm = farms.find(f => f._id.toString() === farmId);
      if (tractor && farm) {
        const label = `${tractor.name} (${tractor.gallons} gal) – ${farm.name}`;
        readableTracked[label] = tractorFarmStartHours[key];
      }
    }

    res.render("admin-form", {
      tractors,
      farms,
      fields,
      pits,
      trackedStartHours: readableTracked,
    });
  } catch (err) {
    console.error("❌ Error loading admin form:", err);
    res.status(500).send("Failed to load admin form");
  }
});

// CRUD routes (unchanged)
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
router.post("/reset-tracking", (req, res) => {
  const key = req.body.key;
  for (const k in tractorFarmStartHours) {
    if (k.includes(key)) {
      delete tractorFarmStartHours[k];
    }
  }
  res.redirect("/admin/form");
});
router.post("/reset-all-tracking", (req, res) => {
  for (let key in tractorFarmStartHours) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

module.exports = router;
