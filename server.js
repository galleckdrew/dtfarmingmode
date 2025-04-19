const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const adminRoutes = require("./routes/adminRoutes");
const editRoutes = require("./routes/editRoutes");
require("dotenv").config();
require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Email scheduler
const setupEmailScheduler = require("./emailScheduler");
setupEmailScheduler();

// Tracked hours memory
const tractorFarmStartHours = require("./trackedHours");

// Models
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const Pump = require("./models/Pump");
const Load = require("./models/Load");
const Fuel = require("./models/Fuel");

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(editRoutes);
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
app.use("/admin", require("./routes/adminRoutes"));
app.use("/load", require("./routes/loadRoutes"));
app.use("/print-report", require("./printRoutes"));
app.use(require("./routes/driverHistoryRoute"));
app.use(require("./routes/submitEndHourRoute"));
app.use(require("./routes/fuelHistoryRoute"));
app.use(require("./routes/transferHistoryRoute"));

// Email test route
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

// Login guard
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
}

// Home
app.get("/", (req, res) => {
  res.redirect("/submit-load");
});

// ✅ Submit Load Form with totalFuel and formatted trackedHours
app.get("/submit-load", requireLogin, async (req, res) => {
  try {
    const [tractors, farms, fields, pits, pumps, farmers, trailers, sands] = await Promise.all([
  Tractor.find(),
  Farm.find(),
  Field.find(),
  Pit.find(),
  Pump.find(),
  Farmer.find(),
  Trailer.find(),
  Sand.find()
]);

    const today = new Date().toISOString().split("T")[0];
    const todayLoads = await Load.find({
      timestamp: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lte: new Date(`${today}T23:59:59.999Z`),
      },
    });

    const totalGallons = todayLoads.reduce((sum, l) => sum + (l.gallons || 0), 0);

    const todayFuel = await Fuel.find({
      timestamp: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lte: new Date(`${today}T23:59:59.999Z`),
      },
    });
    const totalFuel = todayFuel.reduce((sum, f) => sum + (f.amount || 0), 0);

    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate("tractor");

    const lastLoadTractor = lastLoad?.tractor?.name || "N/A";
    const lastLoadGallons = lastLoad?.gallons || "0";
    const lastLoadTime = lastLoad
      ? new Date(lastLoad.timestamp).toLocaleString("en-US", {
          timeZone: "America/New_York",
          hour12: true,
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "N/A";

    // Format trackedHours nicely
    const trackedHours = {};
    for (const key in tractorFarmStartHours) {
      const [tractorId, farmId] = key.split("_");
      const tractor = tractors.find(t => t._id.toString() === tractorId);
      const farm = farms.find(f => f._id.toString() === farmId);

      if (tractor && farm) {
        const label = `${tractor.name} (${tractor.gallons} gal) – ${farm.name}`;
        trackedHours[label] = tractorFarmStartHours[key];
      }
    }

    res.render("submit-load", {
      tractors,
      farms,
      fields,
      pits,
      pumps,
      farmers,
      trailers,
      sands,
      totalGallons,
      totalFuel,
      lastLoadTractor,
      lastLoadGallons,
      lastLoadTime,
      trackedHours,
      selectedTractorId: lastLoad?.tractor?._id?.toString() || '',
      selectedFarmId: '',
      selectedFieldId: ''
    });

  } catch (err) {
    console.error("❌ Error loading form:", err);
    res.status(500).send("Internal Server Error while loading the form.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
