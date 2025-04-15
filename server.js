const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
require("dotenv").config();
require("./db"); // MongoDB connection

const app = express();
const PORT = process.env.PORT || 3000;

// Email scheduler (optional)
const setupEmailScheduler = require("./emailScheduler");
setupEmailScheduler();

// Memory store for start hours
const tractorFarmStartHours = require("./trackedHours");

// Models
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const Load = require("./models/Load");

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tractorsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Routes
app.use("/auth", require("./auth"));
app.use("/admin", require("./adminRoutes"));
app.use("/load", require("./routes/loadRoutes"));
app.use("/print-report", require("./printRoutes"));
app.use(require("./driverHistoryRoute"));

// Test email report
app.get("/send-test-report", async (req, res) => {
  const { sendLoadReportEmail } = require("./emailReport");
  try {
    await sendLoadReportEmail();
    res.send("✅ Test report sent to galleckdrew@gmail.com");
  } catch (err) {
    console.error("❌ Failed to send test report:", err);
    res.status(500).send("❌ Failed to send test report");
  }
});

// Login check middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
}

// Home redirect
app.get("/", (req, res) => {
  res.redirect("/submit-load");
});

// Submit Load Page
app.get("/submit-load", requireLogin, async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();
    const pits = await Pit.find();

    const today = new Date().toISOString().split("T")[0];
    const todayLoads = await Load.find({
      timestamp: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lte: new Date(`${today}T23:59:59.999Z`),
      },
    });

    const totalGallons = todayLoads.reduce((sum, l) => sum + (l.gallons || 0), 0);
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
  } catch (err) {
    console.error("❌ Error loading form:", err);
    res.status(500).send("Internal Server Error while loading the form.");
  }
});

// 404 fallback
app.get("*", (req, res) => {
  res.status(404).send("Page not found.");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
