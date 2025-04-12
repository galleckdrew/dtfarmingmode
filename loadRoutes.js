const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");

const tractorFarmStartHours = {}; // 🧠 Track start hour per tractor + farm combo

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

    if (startHour) {
      tractorFarmStartHours[key] = Number(startHour);
    }

    if (start !== null && end !== null) {
      totalHours = end - start;
      delete tractorFarmStartHours[key];
    }

    if (!start && farm) {
      return res.send(`
        <script>
          alert('⚠️ Please enter a start hour for this tractor before selecting this farm. Each farm needs new start hours.');
          window.location.href = '/submit-load';
        </script>
      `);
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

    const trackedKeys = Object.entries(tractorFarmStartHours)
      .map(([key, hour]) => `<li><strong>${key}</strong>: ${hour}</li>`)
      .join("");

    res.send(`
      <html>
      <head>
        <meta http-equiv="refresh" content="5; URL=/submit-load" />
      </head>
      <body>
        <h2>✅ Load submitted successfully!</h2>
        <p>Redirecting to the load form in 5 seconds...</p>
        <h4>🧠 Current Tracked Start Hours:</h4>
        <ul>${trackedKeys}</ul>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error submitting load:", error);
    res.status(500).json({ error: "❌ Failed to submit load" });
  }
});

module.exports = router;
