const express = require("express");
const router = express.Router();
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// View admin form
router.get("/form", async (req, res) => {
  const farms = await Farm.find();
  const fields = await Field.find();
  const pits = await Pit.find();
  const tractors = await Tractor.find();
  res.render("admin-form", { farms, fields, pits, tractors });
});

// Add Tractor
router.post("/tractors", async (req, res) => {
  const { name, gallons } = req.body;
  await Tractor.create({ name, gallons });
  res.redirect("/admin/form");
});

// Update Tractor
router.put("/tractors/:id", async (req, res) => {
  const { name, gallons } = req.body;
  await Tractor.findByIdAndUpdate(req.params.id, { name, gallons });
  res.redirect("/admin/form");
});

// Delete Tractor
router.delete("/tractors/:id", async (req, res) => {
  await Tractor.findByIdAndDelete(req.params.id);
  res.redirect("/admin/form");
});

// UPDATE ROUTES

// Update Farm
router.put("/farms/:id", async (req, res) => {
  try {
    await Farm.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.redirect("/admin/form");
  } catch (err) {
    res.status(500).send("❌ Failed to update farm");
  }
});

// Update Field
router.put("/fields/:id", async (req, res) => {
  try {
    await Field.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.redirect("/admin/form");
  } catch (err) {
    res.status(500).send("❌ Failed to update field");
  }
});

// Update Pit
router.put("/pits/:id", async (req, res) => {
  try {
    await Pit.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.redirect("/admin/form");
  } catch (err) {
    res.status(500).send("❌ Failed to update pit");
  }
});

// Update Tractor (name and gallons)
router.put("/tractors/:id", async (req, res) => {
  try {
    const { name, gallons } = req.body;
    await Tractor.findByIdAndUpdate(req.params.id, {
      name,
      gallons: Number(gallons),
    });
    res.redirect("/admin/form");
  } catch (err) {
    res.status(500).send("❌ Failed to update tractor");
  }
});


module.exports = router;


