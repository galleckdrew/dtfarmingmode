
const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
require("./db"); // MongoDB connection

const PORT = process.env.PORT || 3000;

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
const driverHistoryRoutes = require("./driverHistoryRoute"); // ✅ Check spelling

// MongoDB Models
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

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

// Driver load form - works for BOTH /submit-load and /load-form
app.get(["/submit-load", "/load-form"], async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();
    const pits = await Pit.find();
    res.render("load-form", { tractors, farms, fields, pits });
  } catch (err) {
    res.status(500).send("❌ Error loading form");
  }
});

// Optional: For backwards compatibility
app.get("/driver-form", (req, res) => {
  res.render("driverForm");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
