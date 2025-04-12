// ✅ Full emailScheduler.js
const cron = require("node-cron");
const { sendLoadReportEmail } = require("./emailReport");

function setupEmailScheduler() {
  // Run at 9:00 AM on the 12th and 28th of each month
  cron.schedule("0 9 12,28 * *", async () => {
    try {
      console.log("📧 Sending scheduled email report...");
      await sendLoadReportEmail();
      console.log("✅ Scheduled email report sent");
    } catch (err) {
      console.error("❌ Failed to send scheduled email report:", err);
    }
  });
}

module.exports = { setupEmailScheduler };
