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

// Driver load form
app.get("/driver-form", (req, res) => {
  res.render("driverForm");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
