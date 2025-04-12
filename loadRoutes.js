// 🚜 Start here: Enhance the load submission logic

const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");

const tractorStartHours = {}; // 🔁 Track start hour per tractor in memory

// POST /load
router.post("/", async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour, endHour } = req.body;

    // Lookup default gallons for the selected tractor
    const tractorData = await Tractor.findById(tractor);
    if (!tractorData) return res.status(404).json({ error: "Tractor not found" });

    const gallons = tractorData.gallons;
    const timestamp = new Date();

    let start = startHour ? Number(startHour) : tractorStartHours[tractor] || null;
    let end = endHour ? Number(endHour) : null;
    let totalHours = null;

    if (startHour) {
      tractorStartHours[tractor] = Number(startHour); // 💾 Save for this tractor
    }

    if (start !== null && end !== null) {
      totalHours = end - start;
      delete tractorStartHours[tractor]; // ✅ Clear after use
    }

    if (!start && farm) {
      return res.send(`
        <script>
          alert('⚠️ Please enter a start hour for this tractor before selecting a farm.');
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
