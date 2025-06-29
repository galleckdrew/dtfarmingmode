// routes/driverHistoryRoute.js
const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Tractor = require("../models/Tractor");
const Farm = require("../models/Farm");
const Field = require("../models/Field");
const Transfer = require("../models/Transfer");

router.get("/driver-history", async (req, res) => {
  try {
    const { from, to, tractor, farm, field, type } = req.query;

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
      Fuel.find(query).populate("tractor field farm"),
      Transfer.find(query).populate("tractor"),
      Tractor.find(),
      Farm.find(),
      Field.find(),
    ]);

    const allEntries = [];

    loads.forEach(l => allEntries.push({ type: "load", data: l }));
    fuels.forEach(f => allEntries.push({ type: "fuel", data: f }));
    transfers.forEach(t => {
      if (t.startHour) {
        allEntries.push({ type: "transfer-start", data: t });
      }
      if (t.endHour) {
        allEntries.push({ type: "transfer-end", data: t });
      }
      if (t.trailer) {
        allEntries.push({ type: "trailer", data: t });
      }
      if (t.sand) {
        allEntries.push({ type: "sand", data: t });
      }
    });

    const filteredEntries = type ? allEntries.filter(e => e.type === type) : allEntries;

    filteredEntries.sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp));

    const totalGallons = filteredEntries
      .filter(e => e.type === "load")
      .reduce((sum, e) => sum + (e.data.gallons || 0), 0);

    const totalFuel = filteredEntries
      .filter(e => e.type === "fuel")
      .reduce((sum, e) => sum + (e.data.gallons || 0), 0);

    const totalHours = filteredEntries
      .filter(e => e.type === "load")
      .reduce((sum, e) => sum + (e.data.totalHours || 0), 0);

    const totalTransferHours = filteredEntries
      .filter(e => e.type === "transfer-start" || e.type === "transfer-end")
      .reduce((sum, e) => {
        const hours = parseFloat(e.data.endHour || 0) - parseFloat(e.data.startHour || 0);
        return sum + (isNaN(hours) ? 0 : hours);
      }, 0);

    const totalLoads = filteredEntries.filter(e => e.type === "load").length;

    res.render("driver-history", {
      allEntries: filteredEntries,
      tractors,
      farms,
      fields,
      from,
      to,
      tractor,
      farm,
      field,
      type,
      totalLoads,
      totalGallons,
      totalFuel,
      totalHours,
      totalTransferHours,
    });
  } catch (err) {
    console.error("❌ Error loading driver history:", err);
    res.status(500).send("Failed to load driver history.");
  }
});

module.exports = router;
