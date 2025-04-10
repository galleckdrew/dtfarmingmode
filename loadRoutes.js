const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor"); // ✅ Make sure this is here

router.post("/", async (req, res) => {
  try {
    const { tractor, farm, field, pit, startHour, endHour } = req.body;

    const tractorData = await Tractor.findById(tractor);
    if (!tractorData) return res.status(404).json({ error: "Tractor not found" });

    const gallons = tractorData.gallons;
    const totalHours = endHour && startHour ? endHour - startHour : null;
    const timestamp = new Date();

    const newLoad = new Load({
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour,
      endHour,
      totalHours,
      timestamp
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
