const express = require("express");
const router = express.Router();
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// ✅ Add Farm
router.post("/farms", async (req, res) => {
  try {
    const farm = new Farm({ name: req.body.name });
    await farm.save();
    res.json({ message: "✅ Farm added!" });
  } catch (err) {
    res.status(500).json({ error: "❌ Error adding farm" });
  }
});

// ✅ View Farms
router.get("/farms", async (req, res) => {
  const farms = await Farm.find();
  res.json(farms);
});

// ✅ Add Field
router.post("/fields", async (req, res) => {
  try {
    const field = new Field({ name: req.body.name });
    await field.save();
    res.json({ message: "✅ Field added!" });
  } catch (err) {
    res.status(500).json({ error: "❌ Error adding field" });
  }
});

// ✅ View Fields
router.get("/fields", async (req, res) => {
  const fields = await Field.find();
  res.json(fields);
});

// ✅ Add Pit
router.post("/pits", async (req, res) => {
  try {
    const pit = new Pit({ name: req.body.name });
    await pit.save();
    res.json({ message: "✅ Pit added!" });
  } catch (err) {
    res.status(500).json({ error: "❌ Error adding pit" });
  }
});

// ✅ View Pits
router.get("/pits", async (req, res) => {
  const pits = await Pit.find();
  res.json(pits);
});

module.exports = router;
