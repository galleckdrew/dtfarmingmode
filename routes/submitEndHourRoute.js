const express = require("express");
const router = express.Router();
const Load = require("../models/Load");
const Tractor = require("../models/Tractor");
const Farm = require("../models/Farm");
const Field = require("../models/Field");
const Pit = require("../models/Pit");
const tractorFarmStartHours = require("../trackedHours");

// 🚜 Submit End Hour Route
router.post("/submit-end-hour", async (req, res) => {
  try {
    const { tractor, farm, field, pit, endHour } = req.body;
    const key = `${tractor}_${farm}`;
    const startHour = tractorFarmStartHours[key];

    console.log("🚜 Tracked Hours:", tractorFarmStartHours);
    console.log("🔍 Looking for key:", key);

    if (startHour === undefined || isNaN(startHour)) {
      return res.send(`
        <script>
          alert('⚠️ No start hour found for this tractor and farm. Please submit a start hour first.');
          window.location.href = '/submit-load';
        </script>
      `);
    }

    const end = parseFloat(endHour.replace(',', '.'));
    let totalHours = end >= startHour ? end - startHour : (24 - startHour + end);
    totalHours = Math.round(totalHours * 100) / 100;

    const tractorData = await Tractor.findById(tractor);
    const farmData = await Farm.findById(farm);
    const gallons = tractorData?.gallons || 0;

    // Generate readable key for admin display
    const readableKey = `${tractorData?.name || 'Tractor'} (${gallons} gal) | ${farmData?.name || 'Farm'}`;

    // Remove old raw ID key, set readable key
    delete tractorFarmStartHours[key];
    tractorFarmStartHours[readableKey] = startHour;

    const newLoad = new Load({
      tractor,
      farm,
      field: field || undefined,
      pit: pit || undefined,
      startHour,
      endHour: end,
      totalHours,
      gallons,
      timestamp: new Date(),
    });

    await newLoad.save();

    res.send(`
      <html>
        <head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head>
        <body>
          <h2>✅ End hour submitted successfully!</h2>
          <p>Redirecting to the load form in 5 seconds...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error in /submit-end-hour:", error);
    res.status(500).send("❌ Failed to submit end hour");
  }
});

module.exports = router;
