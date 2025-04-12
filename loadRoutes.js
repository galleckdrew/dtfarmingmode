const express = require("express");
const router = express.Router();
const moment = require("moment");
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const tractorFarmStartHours = require("./trackedHours");

// =========================
// GET Load Form (submit-load)
// =========================
router.get("/submit-load", async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();
    const pits = await Pit.find();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const loadsToday = await Load.find({
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });

    const totalGallons = loadsToday.reduce((sum, load) => sum + (load.gallons || 0), 0);

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate("tractor farm field");

    res.render("load-form", {
      tractors,
      farms,
      fields,
      pits,
      totalGallons,
      trackedHours: tractorFarmStartHours,
      lastLoad,
      selectedTractorId: lastLoad?.tractor?._id?.toString() || '',
      selectedFarmId: lastLoad?.farm?._id?.toString() || '',
      selectedFieldId: lastLoad?.field?._id?.toString() || ''
    });
  } catch (error) {
    console.error("❌ Error loading submit-load form:", error);
    res.status(500).send("Server Error");
  }
});

// =========================
// GET tracked hours
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

    let start = startHour
      ? parseFloat(startHour.replace(',', '.'))
      : tractorFarmStartHours[key];
    let end = endHour ? parseFloat(endHour.replace(',', '.')) : null;
    let totalHours = null;

    if ((start === undefined || isNaN(start)) && !tractorFarmStartHours[key]) {
      return res.send(`
        <script>
          alert('⚠️ Please enter a start hour for this tractor before using this farm. Each farm needs its own start hour.');
          window.location.href = '/submit-load';
        </script>
      `);
    }

    if (startHour) tractorFarmStartHours[key] = Number(startHour);

    if (start !== null && end !== null && !isNaN(start) && !isNaN(end)) {
      totalHours = end >= start ? end - start : (24 - start + end);
      totalHours = Math.round(totalHours * 100) / 100;
      delete tractorFarmStartHours[key];
    }

    const loadData = {
      tractor,
      farm,
      field,
      pit,
      gallons,
      startHour: !isNaN(start) ? start : undefined,
      timestamp
    };

    if (end !== null && !isNaN(end)) loadData.endHour = end;
    if (totalHours !== null && !isNaN(totalHours)) loadData.totalHours = totalHours;

    const newLoad = new Load(loadData);
    await newLoad.save();

    res.send(`
      <html>
        <head><meta http-equiv="refresh" content="5; URL=/submit-load" /></head>
        <body><h2>✅ Load submitted successfully!</h2><p>Redirecting to the load form in 5 seconds...</p></body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error submitting load:", error);
    res.status(500).json({ error: "❌ Failed to submit load" });
  }
});

// =========================
// GET load-history (Grouped view)
// =========================
router.get("/load-history", async (req, res) => {
  try {
    const allLoads = await Load.find().populate("tractor");
    const grouped = {};

    allLoads.forEach(load => {
      const dateKey = moment(load.timestamp).format("YYYY-MM-DD");
      const tractorName = load.tractor?.name || "Unknown";
      const key = `${dateKey}-${tractorName}`;

      if (!grouped[key]) {
        grouped[key] = {
          date: dateKey,
          tractor: tractorName,
          totalHours: 0,
          totalGallons: 0,
          loads: []
        };
      }

      grouped[key].totalHours += load.totalHours || 0;
      grouped[key].totalGallons += load.gallons || 0;
      grouped[key].loads.push(load);
    });

    const history = Object.values(grouped);
    res.render("load-history", { history, moment });
  } catch (error) {
    console.error("❌ Error generating load history:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
