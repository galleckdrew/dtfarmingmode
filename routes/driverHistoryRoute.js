// routes/driverHistoryRoute.js
const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Transfer = require("../models/Transfer");
const Tractor = require("../models/Tractor");
const Farm = require("../models/Farm");
const Field = require("../models/Field");

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
      Transfer.find(query).populate("tractor field pump farmer trailer sand"),
      Tractor.find(),
      Farm.find(),
      Field.find(),
    ]);

    const allEntries = [];

    // Load entries
    loads.forEach(l => allEntries.push({ type: "load", data: l }));

    // Fuel entries
    fuels.forEach(f => allEntries.push({ type: "fuel", data: f }));

    // Transfer entries (only once per transfer)
    transfers.forEach(t => {
      allEntries.push({ type: "transfer", data: t });
    });

    // Filter if needed
    const filteredEntries = type ? allEntries.filter(e => e.type === type) : allEntries;

    // Sort newest first
    filteredEntries.sort((a, b) => new Date(b.data.timestamp) - new Date(a.data.timestamp));

    // Totals
    const totalLoads = filteredEntries.filter(e => e.type === "load").length;

    const totalGallons = filteredEntries
      .filter(e => e.type === "load")
      .reduce((sum, e) => sum + (e.data.gallons || 0), 0);

    const totalFuel = filteredEntries
      .filter(e => e.type === "fuel")
      .reduce((sum, e) => sum + (e.data.gallons || 0), 0);

    const totalHours = filteredEntries
      .filter(e => e.type === "load")
      .reduce((sum, e) => sum + (e.data.totalHours || 0), 0);

    const rawTransferHours = filteredEntries
      .filter(e => e.type === "transfer")
      .reduce((sum, e) => {
        const start = parseFloat(e.data.startHour || 0);
        const end = parseFloat(e.data.endHour || 0);
        const diff = end > 0 ? end - start : 0;
        return sum + (isNaN(diff) ? 0 : diff);
      }, 0);

    const totalTransferHours = rawTransferHours.toFixed(2);

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
      totalTransferHours
    });
  } catch (err) {
    console.error("❌ Error loading driver history:", err);
    res.status(500).send("Failed to load driver history.");
  }
});

module.exports = router;
