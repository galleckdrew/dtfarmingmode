const express = require("express");
const path = require("path");
const session = require("express-session");
const methodOverride = require("method-override");
const { sendLoadReportEmail } = require("./emailReport"); // ✅ Email function

require("dotenv").config();
require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Session Setup
app.use(session({
  secret: process.env.SESSION_SECRET || "tractorsecret",
  resave: false,
  saveUninitialized: false,
}));

// ✅ Middleware
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Routes
const authRoutes = require("./auth");
const adminRoutes = require("./adminRoutes");
const loadRoutes = require("./loadRoutes");
const printRoutes = require("./printRoutes");
const driverHistoryRoutes = require("./driverHistoryRoute");

// ✅ Models (used in load form page)
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const Load = require("./models/Load");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/load", loadRoutes);
app.use("/print-report", printRoutes);
app.use(driverHistoryRoutes);

// ✅ Login middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
}

// ✅ Homepage
app.get("/", (req, res) => {
  res.render("index");
});

// ✅ Load submission form
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
        $lte: new Date(`${today}T23:59:59.999Z`)
      }
    });

    const totalGallons = todayLoads.reduce((sum, l) => sum + (l.gallons || 0), 0);
    const lastLoad = await Load.findOne().sort({ timestamp: -1 }).populate("tractor");

    res.render("load-form", {
      tractors,
      farms,
      fields,
      pits,
      totalGallons,
      lastLoad
    });
  } catch (err) {
    console.error("❌ Error loading form:", err);
    res.status(500).send("Internal Server Error while loading the form.");
  }
});

// ✅ Test email route
app.get("/send-test-report", async (req, res) => {
  try {
    await sendLoadReportEmail();
    res.send("📬 Test email sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send test report:", err);
    res.status(500).send("❌ Failed to send test report.");
  }
});

// ✅ 404 fallback
app.get("*", (req, res) => {
  res.status(404).send("Page not found.");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
