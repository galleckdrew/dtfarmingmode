const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");

const tractorFarmStartHours = {}; // Track start hour per tractor + farm

// GET tracked hours for frontend to display
router.get("/tracked-hours", (req, res) => {
  res.json(tractorFarmStartHours);
});

// Submit a load
router.post("/", async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour, endHour } = req.body;

    const tractorData = await Tractor.findById(tractor);
    if (!tractorData) return res.status(404).json({ error: "Tractor not found" });

    const gallons = tractorData.gallons;
    const timestamp = new Date();
    const key = `${tractor}_${farm}`;

    let start = startHour ? Number(startHour) : tractorFarmStartHours[key] || null;
    let end = endHour ? Number(endHour) : null;
    let totalHours = null;

    if (!start && !startHour && farm) {
      return res.send(`
        <script>
          alert('⚠️ Please enter a start hour for this tractor before using this farm. Each farm needs its own start hour.');
          window.location.href = '/submit-load';
        </script>
      `);
    }

    // Track start hour if entered
    if (startHour) tractorFarmStartHours[key] = Number(startHour);

    // Calculate total hours, handle midnight wrap
    if (start !== null && end !== null) {
      totalHours = end >= start ? end - start : (24 - start + end);
      delete tractorFarmStartHours[key]; // Clear tracking after use
    }

    const newLoad = new Load({
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour: startHour ? Number(startHour) : undefined,
      endHour: end,
      totalHours,
      timestamp,
    });

    await newLoad.save();

    res.send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="5; URL=/submit-load" />
        </head>
        <body>
          <h2>✅ Load submitted successfully!</h2>
          <p>Redirecting to the load form in 5 seconds...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error submitting load:", error);
    res.status(500).json({ error: "❌ Failed to submit load" });
  }
});

module.exports = router;
