// emailReport.js
const nodemailer = require("nodemailer");
const Load = require("./models/Load");
const Tractor = require("./models/Tractor");
const Location = require("./models/Location");

const EMAIL_TO = "galleckdrew@yahoo.com"; // You can add more later

async function sendEmailReport() {
  try {
    const loads = await Load.find()
      .populate("tractor")
      .populate("location")
      .sort({ timestamp: -1 });

    const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);

    const rows = loads.map(load => {
      const date = new Date(load.timestamp).toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour12: true,
      });
      return `
        <tr>
          <td>${date}</td>
          <td>${load.tractor?.name || ""}</td>
          <td>${load.location?.name || ""}</td>
          <td>${load.gallons}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <h2>🚜 Load Report</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Date</th>
          <th>Tractor</th>
          <th>Location</th>
          <th>Gallons</th>
        </tr>
        ${rows}
      </table>
      <p><strong>Total Gallons:</strong> ${totalGallons}</p>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password from Gmail
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: EMAIL_TO,
      subject: "D&T Load Report",
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email report sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send email report:", err);
  }
}

module.exports = { sendEmailReport };
