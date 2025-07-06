const express = require('express');
const router = express.Router();
const Calf = require('../models/Calf');

// ✅ Add new calf (form)
router.get('/add-calf', (req, res) => {
  res.render('add-calf');
});

// ✅ Handle new calf submission
router.post('/add-calf', async (req, res) => {
  try {
    const { calfId, birthDate } = req.body;
    await Calf.create({ calfId, birthDate });
    res.redirect('/calves');
  } catch (err) {
    console.error("❌ Error adding calf:", err);
    res.status(500).send("Error saving new calf.");
  }
});

// ✅ View all calves
router.get('/calves', async (req, res) => {
  try {
    const calves = await Calf.find().sort({ birthDate: -1 });
    res.render('calf-list', { calves });
  } catch (err) {
    console.error("❌ Error loading calf list:", err);
    res.status(500).send("Error loading calves.");
  }
});

// ✅ View single calf + weight log
router.get('/calves/:id', async (req, res) => {
  try {
    const calf = await Calf.findById(req.params.id);
    if (!calf) return res.status(404).send("❌ Calf not found");
    res.render("calf-detail", { calf });
  } catch (err) {
    console.error("❌ Error loading calf detail:", err);
    res.status(400).send("❌ Invalid Calf ID or Server Error");
  }
});

// ✅ Add a weight entry
router.post('/calves/:id/add-weight', async (req, res) => {
  try {
    const { weight, date } = req.body;
    const calf = await Calf.findById(req.params.id);
    if (!calf) return res.status(404).send("❌ Calf not found");

    calf.weights.push({ weight, date });
    await calf.save();

    res.redirect(`/calves/${req.params.id}`);
  } catch (err) {
    console.error("❌ Error adding weight:", err);
    res.status(400).send("Error saving weight.");
  }
});

module.exports = router;
