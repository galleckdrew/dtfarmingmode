
const express = require("express");
const router = express.Router();

const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// ✅ Admin form page
router.get("/form", (req, res) => {
  res.render("admin-form");
});

// ✅ Handle form submissions for Tractor, Farm, Field, Pit (with gallons)
router.post("/add", async (req, res) => {
  const { tractor, gallons, farm, field, pit } = req.body;

  try {
    if (tractor) {
      await Tractor.create({ name: tractor, gallons: Number(gallons) || 0 });
    }
    if (farm) await Farm.create({ name: farm });
    if (field) await Field.create({ name: field });
    if (pit) await Pit.create({ name: pit });

    res.send("✅ Successfully added items! <a href='/admin/form'>Go back</a>");
  } catch (err) {
    console.error("❌ Error in /admin/add:", err);
    res.status(500).send("❌ Error adding items.");
  }
});

// ✅ Individual API endpoints (optional use)
router.post("/farms", async (req, res) => {
  try {
    const farm = new Farm({ name: req.body.name });
    await farm.save();
    res.json({ message: "✅ Farm added!" });
  } catch (err) {
    res.status(500).json({ error: "❌ Error adding farm" });
  }
});

router.get("/farms", async (req, res) => {
  const farms = await Farm.find();
  res.json(farms);
});

router.post("/fields", async (req, res) => {
  try {
    const field = new Field({ name: req.body.name });
    await field.save();
    res.json({ message: "✅ Field added!" });
  } catch (err) {
    res.status(500).json({ error: "❌ Error adding field" });
  }
});

router.get("/fields", async (req, res) => {
  const fields = await Field.find();
  res.json(fields);
});

router.post("/pits", async (req, res) => {
  try {
    const pit = new Pit({ name: req.body.name });
    await pit.save();
    res.json({ message: "✅ Pit added!" });
  } catch (err) {
    res.status(500).json({ error: "❌ Error adding pit" });
  }
});

router.get("/pits", async (req, res) => {
  const pits = await Pit.find();
  res.json(pits);
});

module.exports = router;
