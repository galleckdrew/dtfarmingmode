const nodemailer = require("nodemailer");
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");

const logoUrl = "https://dandt-manure-hauling.onrender.com/dt-logo.png";

async function sendLoadReportEmail() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const start = new Date(`${today}T00:00:00`);
    const end = new Date(`${today}T23:59:59`);

    const loads = await Load.find({
      timestamp: { $gte: start, $lte: end }
    }).populate("tractor farm field pit");

    if (!loads.length) {
      console.log("No loads found today.");
      return;
    }

    // Group totals by tractor
    const tractorTotals = {};

    loads.forEach(load => {
      const tractor = load.tractor?.name || "Unknown Tractor";
      if (!tractorTotals[tractor]) {
        tractorTotals[tractor] = { gallons: 0, hours: 0 };
      }
      tractorTotals[tractor].gallons += load.gallons || 0;
      tractorTotals[tractor].hours += load.totalHours || 0;
    });

    // Build summary table
    const summaryRows = Object.entries(tractorTotals).map(([tractor, totals]) => `
      <tr>
        <td>${tractor}</td>
        <td>${totals.gallons}</td>
        <td>${totals.hours.toFixed(2)}</td>
      </tr>
    `).join("");

    const summaryTable = `
      <h3>📊 Totals by Tractor</h3>
      <table border="1" cellspacing="0" cellpadding="8">
        <tr>
          <th>Tractor</th><th>Total Gallons</th><th>Total Hours</th>
        </tr>
        ${summaryRows}
      </table>
    `;

    const loadRows = loads.map(load => `
      <tr>
        <td>${new Date(load.timestamp).toLocaleString("en-US", { timeZone: "America/New_York", hour12: true })}</td>
        <td>${load.tractor?.name || ""}</td>
        <td>${load.farm?.name || ""}</td>
        <td>${load.field?.name || ""}</td>
        <td>${load.pit?.name || ""}</td>
        <td>${load.gallons}</td>
        <td>${load.startHour ?? ""}</td>
        <td>${load.endHour ?? ""}</td>
        <td>${load.totalHours ?? ""}</td>
      </tr>
    `).join("");

    const loadTable = `
      <h3>📝 All Loads Today</h3>
      <table border="1" cellspacing="0" cellpadding="8">
        <tr>
          <th>Date & Time</th>
          <th>Tractor</th>
          <th>Farm</th>
          <th>Field</th>
          <th>Pit</th>
          <th>Gallons</th>
          <th>Start Hour</th>
          <th>End Hour</th>
          <th>Total Hours</th>
        </tr>
        ${loadRows}
      </table>
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <img src="${logoUrl}" alt="D&T Logo" style="max-width: 200px; margin-bottom: 20px;" />
        <h2>🚜 D&T Manure Hauling Daily Load Report</h2>
        <p>Date: ${today}</p>
        ${summaryTable}
        <br />
        ${loadTable}
      </div>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"D&T Reports" <${process.env.EMAIL_USER}>`,
      to: "galleckdrew@yahoo.com",
      subject: "📧 Daily Load Report - D&T Manure Hauling",
      html
    });

    console.log("✅ Report email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending load report email:", error);
  }
}

module.exports = { sendLoadReportEmail };
