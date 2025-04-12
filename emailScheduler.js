const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");
const Field = require("./models/Field");
const Pit = require("./models/Pit");

// emailScheduler.js

const { sendLoadReportEmail } = require("./emailReport");

function setupEmailScheduler() {
  // Run on the 12th and 28th of every month at 8 AM
  cron.schedule("0 8 12,28 * *", () => {
    sendLoadReportEmail("galleckdrew@gmail.com");
  });
}

module.exports = { setupEmailScheduler };

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,       // Gmail address
    pass: process.env.EMAIL_PASS        // Gmail app password
  }
});

async function generateReportHTML() {
  const loads = await Load.find().populate("tractor farm field pit").sort({ timestamp: -1 });
  let totalGallons = 0;

  const rows = loads.map(load => {
    totalGallons += load.gallons;
    return `
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
    `;
  }).join("");

  return `
    <html>
      <body>
        <h3>🧾 D&T Manure Hauling Report</h3>
        <table border="1" cellpadding="6" cellspacing="0">
          <tr>
            <th>Date</th>
            <th>Tractor</th>
            <th>Farm</th>
            <th>Field</th>
            <th>Pit</th>
            <th>Gallons</th>
            <th>Start Hour</th>
            <th>End Hour</th>
            <th>Total Hours</th>
          </tr>
          ${rows}
        </table>
        <p><strong>Total Gallons:</strong> ${totalGallons}</p>
      </body>
    </html>
  `;
}

cron.schedule("0 8 12,28 * *", async () => {
  try {
    const html = await generateReportHTML();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "galleckdrew@yahoo.com",
      subject: "🚜 D&T Manure Hauling - Load Report",
      html
    });
    console.log("✅ Report sent to galleckdrew@yahoo.com");
  } catch (err) {
    console.error("❌ Failed to send email report:", err);
  }
});
