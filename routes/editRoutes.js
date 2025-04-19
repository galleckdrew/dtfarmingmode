const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Fuel = require("../models/Fuel");
const Transfer = require("../models/Transfer");

// LOADS
router.get("/edit-load/:id", async (req, res) => {
  const load = await Load.findById(req.params.id).populate("tractor farm field pit");
  res.render("edit-load", { load });
});

router.post("/edit-load/:id", async (req, res) => {
  const { gallons, startHour, endHour } = req.body;
  console.log("EDITING LOAD:", req.params.id, req.body); // ✅ for debugging
  await Load.findByIdAndUpdate(req.params.id, { gallons, startHour, endHour });
  res.redirect("/driver-history");
});

router.post("/delete-load/:id", async (req, res) => {
  await Load.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

// FUELS
router.get("/edit-fuel/:id", async (req, res) => {
  const fuel = await Fuel.findById(req.params.id).populate("tractor field");
  res.render("edit-fuel", { fuel });
});

router.post("/edit-fuel/:id", async (req, res) => {
  const { amount } = req.body;
  console.log("EDITING FUEL:", req.params.id, req.body);
  await Fuel.findByIdAndUpdate(req.params.id, { amount });
  res.redirect("/driver-history");
});

router.post("/delete-fuel/:id", async (req, res) => {
  await Fuel.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

// TRANSFERS
router.get("/edit-transfer/:id", async (req, res) => {
  const transfer = await Transfer.findById(req.params.id).populate("tractor");
  res.render("edit-transfer", { transfer });
});

router.post("/edit-transfer/:id", async (req, res) => {
  const { startHour, endHour, trailer, sand } = req.body;
  console.log("EDITING TRANSFER:", req.params.id, req.body);
  await Transfer.findByIdAndUpdate(req.params.id, { startHour, endHour, trailer, sand });
  res.redirect("/driver-history");
});

router.post("/delete-transfer/:id", async (req, res) => {
  await Transfer.findByIdAndDelete(req.params.id);
  res.redirect("/driver-history");
});

module.exports = router;
