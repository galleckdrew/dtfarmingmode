// Add this route inside your server.js or loadRoutes.js if not already there
const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const tractorFarmStartHours = require("./trackedHours");

router.post("/submit-end-hour", async (req, res) => {
  try {
    const { tractor, farm, field, endHour } = req.body;
    const key = `${tractor}_${farm}`;
    const startHour = tractorFarmStartHours[key];

    if (!startHour || isNaN(startHour)) {
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

    const newLoad = new Load({
      tractor,
      farm,
      field,
      startHour,
      endHour: end, // Ensure only one endHour field is stored
      totalHours,
      timestamp: new Date(),
    });

    await newLoad.save();
    delete tractorFarmStartHours[key];

    res.send(`
      <html>
        <head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head>
        <body><h2>✅ End hour submitted successfully!</h2><p>Redirecting to the load form in 5 seconds...</p></body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error in /submit-end-hour:", error);
    res.status(500).send("❌ Failed to submit end hour");
  }
});

module.exports = router;
