const express = require("express");
const router = express.Router();
const moment = require("moment");
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const tractorFarmStartHours = require("./trackedHours");

// =========================
// GET tracked hours (for frontend display)
// =========================
router.get("/tracked-hours", (req, res) => {
  res.json(tractorFarmStartHours);
});

// =========================
// POST / (Submit Load)
// =========================
router.post("/", async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour, endHour } = req.body;

    const tractorData = await Tractor.findById(tractor);
    if (!tractorData) return res.status(404).json({ error: "Tractor not found" });

    const gallons = tractorData.gallons;
    const timestamp = new Date();
    const key = `${tractor}_${farm}`;

    // Convert start and end hours to decimal (supporting comma and dot)
    let start = parseFloat(startHour?.replace(',', '.'));
    let end = endHour ? parseFloat(endHour.replace(',', '.')) : null;
    let totalHours = null;

    // Prevent submission without startHour for that tractor+farm
    if ((start === undefined || isNaN(start)) && farm) {
      return res.send(`
        <script>
          alert('⚠️ Please enter a start hour for this tractor before using this farm. Each farm needs its own start hour.');
          window.location.href = '/submit-load';
        </script>
      `);
    }

    // Track start hour
    if (startHour) {
      tractorFarmStartHours[key] = Number(startHour);
    }

    // If both start and end exist, calculate totalHours and clear tracking
    if (start !== null && end !== null && !isNaN(start) && !isNaN(end)) {
      totalHours = end >= start ? end - start : (24 - start + end);
      totalHours = Math.round(totalHours * 100) / 100;
      delete tractorFarmStartHours[key];
    }

    // Safely build Load object
    const loadData = {
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour: !isNaN(start) ? start : undefined,
      timestamp
    };

    if (end !== null && !isNaN(end)) {
      loadData.endHour = end;
    }

    if (totalHours !== null && !isNaN(totalHours)) {
      loadData.totalHours = totalHours;
    }

    const newLoad = new Load(loadData);
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
       }
    });
      
        module.exports = router;
       

        
