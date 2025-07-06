// routes/calfRoutes.js
const express = require('express');
const router = express.Router();
const Calf = require('../models/Calf');

// New calf form
router.get('/add-calf', (req, res) => {
  res.render('add-calf');
});

// Submit new calf
router.post('/add-calf', async (req, res) => {
  const { calfId, birthDate } = req.body;
  await Calf.create({ calfId, birthDate });
  res.redirect('/calves');
});

// View all calves
router.get('/calves', async (req, res) => {
  const calves = await Calf.find().sort({ birthDate: -1 });
  res.render('calf-list', { calves });
});

// View individual calf + weight form
router.get('/calves/:id', async (req, res) => {
  const calf = await Calf.findById(req.params.id);
  res.render('calf-detail', { calf });
});

// Submit weight entry
router.post('/calves/:id/add-weight', async (req, res) => {
  const { weight, date } = req.body;
  const calf = await Calf.findById(req.params.id);
  calf.weights.push({ weight, date });
  await calf.save();
  res.redirect(`/calves/${req.params.id}`);
});

module.exports = router;
