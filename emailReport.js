let totalGallons = 0;
let totalHours = 0;

const rows = loads.map(load => {
  totalGallons += load.gallons || 0;
  totalHours += load.totalHours || 0;
  return `
    <tr>
      <td>${new Date(load.timestamp).toLocaleString("en-US", {
        timeZone: "America/New_York",
        hour12: true,
      })}</td>
      <td>${load.tractor?.name || ""}</td>
      <td>${load.farm?.name || ""}</td>
      <td>${load.field?.name || ""}</td>
      <td>${load.pit?.name || ""}</td>
      <td>${load.gallons || 0}</td>
      <td>${load.startHour ?? ""}</td>
      <td>${load.endHour ?? ""}</td>
      <td>${load.totalHours ?? ""}</td>
    </tr>`;
}).join("");

const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${LOGO_URL}" alt="D&T Logo" style="max-width: 250px; border-radius: 10px;" />
      <h2>D&T Manure Hauling - Load Report</h2>
    </div>
    <table style="width: 100%; border-collapse: collapse;" border="1" cellpadding="8">
      <thead style="background-color: #f2f2f2;">
        <tr>
          <th>Date & Time</th>
          <th>Tractor</th>
          <th>Farm</th>
          <th>Field</th>
          <th>Pit</th>
          <th>Gallons</th>
          <th>Start</th>
          <th>End</th>
          <th>Total Hours</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top: 20px; font-weight: bold;">
      ✅ Total Gallons: ${totalGallons} | 🕒 Total Hours: ${totalHours}
    </p>
    <p style="font-size: 12px; color: #777;">
      Sent automatically by the D&T Load Tracker.
    </p>
  </div>
`;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

await transporter.sendMail({
  from: `"D&T Load Tracker" <${process.env.EMAIL_USER}>`,
  to: recipients,
  subject: "📝 D&T Load Report",
  html,
});

console.log("✅ Report sent to:", recipients);
