// emailScheduler.js
const cron = require("node-cron");
const { sendLoadReportEmail } = require("./emailReport");

function startEmailScheduler() {
  // Schedule to run at 8 AM EST on the 12th and 28th
  cron.schedule("0 13 12,28 * *", async () => {
    try {
      console.log("📧 Running scheduled email report...");
      await sendLoadReportEmail();
      console.log("✅ Scheduled email sent successfully.");
    } catch (err) {
      console.error("❌ Error sending scheduled report:", err);
    }
  });
}

module.exports = startEmailScheduler;
