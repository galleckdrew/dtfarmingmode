const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
require("dotenv").config();
require("./db"); // MongoDB connection

const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "tractorsecret",
  resave: false,
  saveUninitialized: false,
}));

// Set up EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require("./auth");
const adminRoutes = require("./adminRoutes");
const loadRoutes = require("./loadRoutes");
const printRoutes = require("./printRoutes");
const driverHistoryRoutes = require("./driverHistoryRoute");

// Models for form
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
app.use(driverHistoryRoutes); // contains /driver-history

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Middleware to require login
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  next();
}

// ✅ Driver load form page with session login and extra info
app.get("/submit-load", requireLogin, async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();
    const pits = await Pit.find();

// ✅ Total gallons for today
const today = new Date().toISOString().split("T")[0];
const todayStart = new Date(`${today}T00:00:00.000Z`);
const todayEnd = new Date(`${today}T23:59:59.999Z`);
const todayLoads = await Load.find({
  timestamp: { $gte: todayStart, $lte: todayEnd }
});
const totalGallons = todayLoads.reduce((sum, load) => sum + (load.gallons || 0), 0);


    // ✅ Last submitted load
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

// Fallback route
app.get("*", (req, res) => {
  res.status(404).send("Page not found.");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
