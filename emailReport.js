const nodemailer = require("nodemailer");
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Farm = require("./models/Farm");

async function sendLoadReportEmail() {
  const today = new Date().toISOString().split("T")[0];
  const start = new Date(`${today}T00:00:00`);
  const end = new Date(`${today}T23:59:59`);

  const loads = await Load.find({ timestamp: { $gte: start, $lte: end } })
    .populate("tractor")
    .populate("farm");

  const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);
  const totalLoads = loads.length;

  const rows = loads.map(l => {
    return `<tr>
      <td>${new Date(l.timestamp).toLocaleString("en-US", { timeZone: "America/New_York", hour12: true })}</td>
      <td>${l.tractor?.name || ""}</td>
      <td>${l.farm?.name || ""}</td>
      <td>${l.gallons}</td>
      <td>${l.startHour ?? ""}</td>
      <td>${l.endHour ?? ""}</td>
    </tr>`;
  }).join("");

  const html = `
    <h2>D&T Load Report for ${today}</h2>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr>
        <th>Timestamp</th>
        <th>Tractor</th>
        <th>Farm</th>
        <th>Gallons</th>
        <th>Start Hour</th>
        <th>End Hour</th>
      </tr>
      ${rows}
    </table>
    <p><strong>Total Loads:</strong> ${totalLoads}</p>
    <p><strong>Total Gallons:</strong> ${totalGallons}</p>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "galleckdrew@yahoo.com",
    subject: `D&T Daily Load Report - ${today}`,
    html
  });

  console.log("✅ Email report sent");
}

module.exports = { sendLoadReportEmail };
