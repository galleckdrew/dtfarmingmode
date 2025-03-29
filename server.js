require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

const bcrypt = require("bcryptjs");

require("dotenv").config();
require("./db"); // MongoDB connection

// Set EJS view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Models for dropdowns
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// Route to render driver load submission form
app.get("/driver-form", async (req, res) => {
  try {
    const tractors = await Tractor.find();
    const farms = await Farm.find();
    const fields = await Field.find();
    const pits = await Pit.find();
    res.render("driverForm", { tractors, farms, fields, pits });
  } catch (err) {
    res.status(500).send("❌ Error loading form");
  }
});

// Routes
const authRoutes = require("./auth");
const adminRoutes = require("./adminRoutes");
const loadRoutes = require("./loadRoutes");
const printRoutes = require("./printRoutes");
const driverHistoryRoutes = require("./driverHistoryRoute");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/load", loadRoutes);
app.use("/print-report", printRoutes);
app.use(driverHistoryRoutes); // handles /driver-history

// Home route renders index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
