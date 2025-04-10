const express = require("express");
const router = express.Router();
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Location = require("./models/Location");

router.get("/print-report", async (req, res) => {
  try {
    const loads = await Load.find().populate("tractor").populate("location");

    let totalGallons = 0;

    const rows = loads.map(load => {
      // Check if timestamp exists and is a valid date
      const formattedTimestamp = load.timestamp instanceof Date
        ? load.timestamp.toLocaleString()
        : "N/A";

      // Check if tractor and location exist
      const tractorName = load.tractor?.name || "Unknown Tractor";
      const locationName = load.location?.name || "Unknown Location";

      totalGallons += load.gallons || 0;

      return `
        <tr>
          <td>${formattedTimestamp}</td>
          <td>${tractorName}</td>
          <td>${locationName}</td>
          <td>${load.gallons || 0}</td>
          <td>${load.startHour || "N/A"}</td>
          <td>${load.endHour || "N/A"}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <html>
      <head>
        <title>Printable Load Report</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
          h2 { text-align: center; }
          .total { margin-top: 20px; font-weight: bold; }
          .print-button { margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <h2>Load Report</h2>
        <table>
          <tr>
            <th>Date & Time</th>
            <th>Tractor</th>
            <th>Location</th>
            <th>Gallons</th>
            <th>Start Hour</th>
            <th>End Hour</th>
          </tr>
          ${rows}
        </table>
        <div class="total">Total Gallons: ${totalGallons}</div>
        <div class="print-button">
          <button onclick="window.print()">Print</button>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("Print Report Error:", err);
    res.status(500).send("❌ Failed to generate report");
  }
});

module.exports = router;
