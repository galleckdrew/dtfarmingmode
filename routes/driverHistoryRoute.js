const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Tractor = require("../models/Tractor");
const Farm = require("../models/Farm");
const Field = require("../models/Field");
const Transfer = require("../models/Transfer");

// Helper for login protection (not used currently, but ready if needed)
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
}

router.get("/driver-history", async (req, res) => {
  try {
    const { from, to, tractor, farm, field } = req.query;

    const query = {};
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to + "T23:59:59.999Z");
    }
    if (tractor) query.tractor = tractor;
    if (farm) query.farm = farm;
    if (field) query.field = field;

    const [loads, fuels, transfers, tractors, farms, fields] = await Promise.all([
      Load.find(query).populate("tractor farm field pit"),
      Fuel.find(query).populate("tractor field"),
      Transfer.find(query).populate("tractor"),
      Tractor.find(),
      Farm.find(),
      Field.find(),
    ]);

    // Prepare unified list
    const allEntries = [];

    // Push loads
    loads.forEach(l => allEntries.push({ type: "load", data: l }));

    // Push fuels
    fuels.forEach(f => allEntries.push({ type: "fuel", data: f }));

    // Push transfer entries manually with _id and required fields
    transfers.forEach(t => {
      allEntries.push({
        type: "transfer-start",
        data: {
          _id: t._id,
          tractor: t.tractor,
          startHour: t.startHour,
          timestamp: t.timestamp,
          section: "start",
          label: "Start Hour"
        }
      });
      allEntries.push({
        type: "transfer-end",
        data: {
          _id: t._id,
          tractor: t.tractor,
          endHour: t.endHour,
          timestamp: t.timestamp,
          section: "end",
          label: "End Hour"
        }
      });
      if (t.trailer) {
        allEntries.push({
          type: "trailer",
          data: {
            _id: t._id,
            tractor: t.tractor,
            trailer: t.trailer,
            timestamp: t.timestamp,
            label: "Trailer"
          }
        });
      }
      if (t.sand) {
        allEntries.push({
          type: "sand",
          data: {
            _id: t._id,
            tractor: t.tractor,
            sand: t.sand,
            timestamp: t.timestamp,
            label: "Sand"
          }
        });
      }
    });

    // Sort by newest timestamp
    allEntries.sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp));

    const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);
    const totalFuel = fuels.reduce((sum, f) => sum + (f.amount || 0), 0);
    const totalHours = loads.reduce((sum, l) => sum + (l.totalHours || 0), 0);
    const totalLoads = loads.length;

    res.render("driver-history", {
      allEntries,
      loads,
      fuelEntries: fuels,
      transferEntries: transfers,
      tractors,
      farms,
      fields,
      from,
      to,
      tractor,
      farm,
      field,
      totalLoads,
      totalGallons,
      totalHours,
      totalFuel
    });

  } catch (err) {
    console.error("❌ Error loading driver history:", err);
    res.status(500).send("Failed to load driver history.");
  }
});

module.exports = router;
