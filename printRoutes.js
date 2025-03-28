const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Location = require("./models/Location");

// Route: GET /print-report
router.get("/", async (req, res) => {
  try {
    const loads = await Load.find()
      .populate("tractor")
      .populate("location")
      .sort({ createdAt: -1 });

    let totalGallons = 0;

    const htmlRows = loads.map(load => {
      totalGallons += load.gallons;
      return `
        <tr>
          <td>${load.createdAt.toLocaleString()}</td>
          <td>${load.tractor.name}</td>
          <td>${load.location.name}</td>
          <td>${load.gallons}</td>
          <td>${load.startHour}</td>
          <td>${load.endHour}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <html>
        <head>
          <title>Tractor Load Report</title>
          <style>
            table, th, td { border: 1px solid black; border-collapse: collapse; padding: 8px; }
          </style>
        </head>
        <body>
          <h1>🚜 Tractor Load Report</h1>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Tractor</th>
                <th>Location</th>
                <th>Gallons</th>
                <th>Start Hour</th>
                <th>End Hour</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
          <h3>Total Gallons: ${totalGallons}</h3>
        </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error("Error loading report:", error);
    res.status(500).send("❌ Error loading report");
  }
});

module.exports = router;
