const express = require("express");
const router = express.Router();
const moment = require("moment");
const Fuel = require("../models/Fuel");
const Tractor = require("../models/Tractor");
const Field = require("../models/Field");

// =========================
// GET /fuel-history
// =========================
router.get("/fuel-history", async (req, res) => {
  try {
    const { from, to, tractor, field } = req.query;

    const query = {};
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = toDate;
      }
    }
    if (tractor) query.tractor = tractor;
    if (field) query.field = field;

    const fuels = await Fuel.find(query).populate("tractor field").sort({ timestamp: -1 });

    const tractors = await Tractor.find();
    const fields = await Field.find();

    const totalFuel = fuels.reduce((sum, fuel) => sum + (fuel.amount || 0), 0);

    res.render("fuel-history", {
      fuels,
      tractors,
      fields,
      from,
      to,
      tractor,
      field,
      totalFuel
    });
  } catch (err) {
    console.error("❌ Error fetching fuel history:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
