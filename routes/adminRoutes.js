const express = require("express");
const router = express.Router();
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const Pump = require("./models/Pump");
const Farmer = require("./models/Farmer");
const Trailer = require("./models/Trailer");
const Sand = require("./models/Sand");
const { tractorFarmStartHours } = require("./routes/loadRoutes");

// Admin Form with readable tracked start hours
router.get("/form", async (req, res) => {
  const [tractors, farms, fields, pits, pumps, farmers, trailers, sands] = await Promise.all([
    Tractor.find(),
    Farm.find(),
    Field.find(),
    Pit.find(),
    Pump.find(),
    Farmer.find(),
    Trailer.find(),
    Sand.find()
  ]);

  const readableTrackedHours = {};
  for (const key in tractorFarmStartHours) {
    const [tractorId, farmId] = key.split("_");
    const tractor = tractors.find(t => t._id.toString() === tractorId);
    const farm = farms.find(f => f._id.toString() === farmId);
    const label = `${tractor?.name || tractorId} (${tractor?.gallons || "?"} gal) – ${farm?.name || farmId}`;
    readableTrackedHours[label] = tractorFarmStartHours[key];
  }

  res.render("admin-form", {
    tractors,
    farms,
    fields,
    pits,
    pumps,
    farmers,
    trailers,
    sands,
    trackedStartHours: readableTrackedHours,
  });
});


// Generic create, update, delete handlers
const collections = {
  tractors: Tractor,
  farms: Farm,
  fields: Field,
  pits: Pit,
  pumps: Pump,
  farmers: Farmer,
  trailers: Trailer,
  sands: Sand
};

Object.entries(collections).forEach(([route, Model]) => {
  router.post(`/${route}`, async (req, res) => {
    const data = req.body;
    await Model.create(data);
    res.redirect("/admin/form");
  });

  router.put(`/${route}/:id`, async (req, res) => {
    const data = req.body;
    await Model.findByIdAndUpdate(req.params.id, data);
    res.redirect("/admin/form");
  });

  router.delete(`/${route}/:id`, async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.redirect("/admin/form");
  });
});

// TRACKING RESET
router.post("/reset-tracking", (req, res) => {
  const key = req.body.key;
  if (key && tractorFarmStartHours[key]) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

router.post("/reset-all-tracking", (req, res) => {
  for (const key in tractorFarmStartHours) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

module.exports = router;
