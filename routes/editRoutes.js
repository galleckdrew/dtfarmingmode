const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Transfer = require("../models/Transfer");
const Tractor = require("../models/Tractor");
const Field = require("../models/Field");
const Pump = require("../models/Pump");
const Farmer = require("../models/Farmer");
const Trailer = require("../models/Trailer");
const Sand = require("../models/Sand");

// LOADS
router.get("/edit-load/:id", async (req, res) => {
  const load = await Load.findById(req.params.id).populate("tractor farm field pit");
  const fields = await Field.find();
  res.render("edit-load", { load, fields });
});

router.post("/edit-load/:id", async (req, res) => {
  try {
    const { fieldId, timestamp, gallons, startHour, endHour } = req.body;

    let start = startHour ? parseFloat(startHour) : null;
    let end = endHour ? parseFloat(endHour) : null;
    let totalHours = null;

    if (!isNaN(start) && !isNaN(end)) {
      totalHours = end >= start ? end - start : 24 - start + end;
      totalHours = Math.round(totalHours * 100) / 100;
    }

    await Load.findByIdAndUpdate(req.params.id, {
      field: fieldId,
      timestamp: new Date(timestamp),
      gallons: gallons ? parseFloat(gallons) : undefined,
      startHour: !isNaN(start) ? start : undefined,
      endHour: !isNaN(end) ? end : undefined,
      totalHours
    });

    res.redirect("/driver-history");
  } catch (err) {
    console.error("❌ Failed to update load:", err);
    res.status(500).send("Update failed");
  }
});

router.post("/delete-load/:id", async (req, res) => {
  await Load.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

// FUELS
router.get("/edit-fuel/:id", async (req, res) => {
  const fuel = await Fuel.findById(req.params.id).populate("tractor field farm");
  const [tractors, fields, farms] = await Promise.all([
    Tractor.find(),
    Field.find(),
    Farmer.find()
  ]);
  res.render("edit-fuel", { fuel, tractors, fields, farms });
});

router.post("/edit-fuel/:id", async (req, res) => {
  try {
    const { tractor, field, farm, amount, timestamp } = req.body;
    await Fuel.findByIdAndUpdate(req.params.id, {
      tractor,
      field,
      farm,
      amount: parseFloat(amount),
      timestamp: new Date(timestamp)
    });
    res.redirect("/driver-history");
  } catch (err) {
    console.error("❌ Failed to update fuel:", err);
    res.status(500).send("Failed to update fuel entry.");
  }
});

router.post("/delete-fuel/:id", async (req, res) => {
  await Fuel.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

// TRANSFERS
router.get("/edit-transfer/:id", async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id).populate('tractor field pump farmer trailer sand');
    const [tractors, fields, pumps, farmers, trailers, sands] = await Promise.all([
      Tractor.find(),
      Field.find(),
      Pump.find(),
      Farmer.find(),
      Trailer.find(),
      Sand.find()
    ]);

    res.render("edit-transfer", {
      transfer,
      tractors,
      fields,
      pumps,
      farmers,
      trailers,
      sands
    });
  } catch (err) {
    console.error("❌ Failed to load transfer edit page:", err);
    res.status(500).send("Failed to load transfer edit page.");
  }
});

router.post("/edit-transfer/:id", async (req, res) => {
  try {
    const {
      tractor,
      field,
      pump,
      farmer,
      trailer,
      sand,
      startHour,
      endHour,
      timestamp
    } = req.body;

    const updateData = {
      tractor,
      field,
      startHour: startHour ? parseFloat(startHour) : undefined,
      endHour: endHour ? parseFloat(endHour) : undefined,
      timestamp: new Date(timestamp),
    };

    if (pump) updateData.pump = pump;
    if (farmer) updateData.farmer = farmer;
    if (trailer) updateData.trailer = trailer;
    if (sand) updateData.sand = sand;

    if (
      updateData.startHour !== undefined &&
      updateData.endHour !== undefined &&
      !isNaN(updateData.startHour) &&
      !isNaN(updateData.endHour)
    ) {
      updateData.totalHours = Math.round(
        (updateData.endHour >= updateData.startHour
          ? updateData.endHour - updateData.startHour
          : 24 - updateData.startHour + updateData.endHour) * 100
      ) / 100;
    }

    await Transfer.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/driver-history");
  } catch (err) {
    console.error("❌ Failed to update transfer:", err);
    res.status(500).send("Failed to update transfer entry.");
  }
});

router.post("/delete-transfer/:id", async (req, res) => {
  await Transfer.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

module.exports = router;
