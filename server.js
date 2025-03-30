const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
require("dotenv").config();
require("./db"); // MongoDB connection

const PORT = process.env.PORT || 3000;

// ✅ Clean Session Setup (Only once)
app.use(session({
  secret: process.env.SESSION_SECRET || "tractorsecret",
  resave: false,
  saveUninitialized: false,
}));

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./auth");
const adminRoutes = require("./adminRoutes");
const loadRoutes = require("./loadRoutes");
const printRoutes = require("./printRoutes");
const driverHistoryRoutes = require("./driverHistoryRoute");

// Models
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");
const Load = require("./models/Load");

// Register Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/load", loadRoutes);
app.use("/print-report", printRoutes);
app.use(driverHistoryRoutes);

// Homepage
app.get("/", (req, res) => {
  res.render("index");
});

// ✅ Login Required Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/auth/login");
  next();
}

// ✅ Load Form with Summary Info
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

// 404
app.get("*", (req, res) => {
  res.status(404).send("Page not found.");
});

// Start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
