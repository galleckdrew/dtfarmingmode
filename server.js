const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.get("/driver-form", (req, res) => {
  res.render("driverForm");
});

const authRoutes = require("./auth"); // Authentication routes
const adminRoutes = require("./adminRoutes"); // Admin (tractors/locations) routes
const loadRoutes = require("./loadRoutes"); // Load submission routes
const printRoutes = require("./printRoutes"); // Printable report route

require("dotenv").config();
require("./db"); // MongoDB connection

const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);     // Tractors and locations
app.use("/load", loadRoutes);       // Load submissions
app.use("/print-report", printRoutes); // Printable report
app.use("/admin", adminRoutes);

const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

app.get("/submit-load", async (req, res) => {
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

// Default route
app.get("/", (req, res) => {
  res.send("✅ Node.js server is running successfully!");
});

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
  res.render("index");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


