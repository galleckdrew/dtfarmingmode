const nodemailer = require("nodemailer");
const Load = require("./models/Load");

const EMAIL_TO = "galleckdrew@gmail.com";

async function sendLoadReportEmail() {
  try {
    const loads = await Load.find().populate("tractor");

    const today = new Date().toLocaleDateString("en-US", {
      timeZone: "America/New_York",
    });

    const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);

    const rows = loads
      .map((load) => {
        return `
        <tr>
          <td>${new Date(load.timestamp).toLocaleString("en-US", {
            timeZone: "America/New_York",
          })}</td>
          <td>${load.tractor?.name || ""}</td>
          <td>${load.gallons}</td>
        </tr>
      `;
      })
      .join("");

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>D&T Manure Hauling - Load Report</h2>
          <p>Date: ${today}</p>
          <table border="1" cellpadding="6" cellspacing="0" width="100%">
            <tr style="background-color: #f2f2f2;">
              <th>Date</th>
              <th>Tractor</th>
              <th>Gallons</th>
            </tr>
            ${rows}
          </table>
          <h3>Total Gallons: ${totalGallons}</h3>
          <img src="https://dandt-manure-hauling.onrender.com/public/dt-bg.png" alt="D&T Logo" width="300" />
        </body>
      </html>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"D&T Report" <${process.env.EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: "🚜 D&T Load Report",
      html,
    });

    console.log("✅ Report sent to:", EMAIL_TO);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
}

module.exports = { sendLoadReportEmail };
