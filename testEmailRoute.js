// testEmailRoute.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Load = require("./models/Load");
require("dotenv").config();

router.get("/test-email", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const loads = await Load.find({
      timestamp: {
        $gte: new Date(`${today}T00:00:00.000Z`),
        $lte: new Date(`${today}T23:59:59.999Z`),
      },
    }).populate("tractor farm field pit");

    const totalGallons = loads.reduce((sum, l) => sum + (l.gallons || 0), 0);

    let content = `<h2>Daily Load Report for ${today}</h2><ul>`;
    loads.forEach((l) => {
      content += `<li>${new Date(l.timestamp).toLocaleString()} - ${l.tractor?.name || "N/A"} - ${l.gallons} gal</li>`;
    });
    content += `</ul><p><strong>Total Gallons:</strong> ${totalGallons}</p>`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"D&T Hauling" <${process.env.EMAIL_USER}>`,
      to: "galleckdrew@yahoo.com",
      subject: "Test Email: Daily Load Report",
      html: content,
    });

    res.send("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Email failed:", err);
    res.status(500).send("❌ Email test failed.");
  }
});

module.exports = router;
