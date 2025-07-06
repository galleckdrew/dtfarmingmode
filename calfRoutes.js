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

module.exports = router;
