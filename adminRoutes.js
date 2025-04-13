const express = require("express");
const router = express.Router();
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const { tractorFarmStartHours } = require("./loadRoutes");

// Helper to get names from IDs
async function getReadableTrackedHours() {
  const tractors = await Tractor.find();
  const farms = await Farm.find();

  const readable = {};

  for (const key in tractorFarmStartHours) {
    const [tractorId, farmId] = key.split("_");
    const tractor = tractors.find(t => t._id.toString() === tractorId);
    const farm = farms.find(f => f._id.toString() === farmId);

    const tractorName = tractor ? `${tractor.name} (${tractor.gallons} gal)` : tractorId;
    const farmName = farm ? farm.name : farmId;

    readable[`${tractorName} - ${farmName}`] = tractorFarmStartHours[key];
  }

  return readable;
}

// GET Admin Form
router.get("/form", async (req, res) => {
  const tractors = await Tractor.find();
  const farms = await Farm.find();
  const fields = await Field.find();
  const pits = await Pit.find();
  const readableTrackedHours = await getReadableTrackedHours();

  res.render("admin-form", {
    tractors,
    farms,
    fields,
    pits,
    trackedStartHours: readableTrackedHours,
  });
});

// Reset a specific start hour
router.post("/reset-tracking", (req, res) => {
  const key = req.body.key;
  for (const storedKey in tractorFarmStartHours) {
    if (storedKey.includes(key)) {
      delete tractorFarmStartHours[storedKey];
    }
  }
  res.redirect("/admin/form");
});

// Reset all
router.post("/reset-all-tracking", (req, res) => {
  for (const key in tractorFarmStartHours) {
    delete tractorFarmStartHours[key];
  }
  res.redirect("/admin/form");
});

// Add/update/delete routes omitted for brevity...

module.exports = router;
