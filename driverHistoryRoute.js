// driverHistoryRoute.js
const express = require("express");
const router = express.Router();
const moment = require("moment");
const Load = require("./models/Load");
const Fuel = require("./models/Fuel");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");

router.get("/driver-history", async (req, res) => {
  try {
    const { from, to, tractor, farm, field } = req.query;

    const query = {};
    const fuelQuery = {};

    if (from || to) {
      query.timestamp = {};
      fuelQuery.timestamp = {};
      if (from) {
        query.timestamp.$gte = new Date(from);
        fuelQuery.timestamp.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = toDate;
        fuelQuery.timestamp.$lte = toDate;
      }
    }

    if (tractor) query.tractor = tractor;
    if (farm) query.farm = farm;
    if (field) query.field = field;
    if (tractor) fuelQuery.tractor = tractor;
    if (field) fuelQuery.field = field;

    const [loads, fuels, tractors, farms, fields] = await Promise.all([
      Load.find(query).populate("tractor farm field pit"),
      Fuel.find(fuelQuery).populate("tractor field"),
      Tractor.find(),
      Farm.find(),
      Field.find()
    ]);

    const allEntries = [
      ...loads.map(l => ({ type: "load", data: l })),
      ...fuels.map(f => ({ type: "fuel", data: f }))
    ].sort((a, b) => new Date(a.data.timestamp) - new Date(b.data.timestamp));

    const totalLoads = loads.length;
    const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);
    const totalHours = loads.reduce((sum, l) => sum + (l.totalHours || 0), 0);
    const totalFuel = fuels.reduce((sum, f) => sum + (f.amount || 0), 0);

    res.render("driver-history", {
  loads, // ✅ Add this line
  totalLoads,
  totalGallons,
  totalHours,
  totalFuel,
  fuelEntries,
  transferEntries
});
 } catch (err) {
    console.error("❌ Error loading driver history:", err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
