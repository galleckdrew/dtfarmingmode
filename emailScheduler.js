// emailScheduler.js
const cron = require("node-cron");
const { sendLoadReportEmail } = require("./emailReport");

// Run at 8:00 AM on the 12th and 28th of every month
cron.schedule("0 8 12,28 * *", async () => {
  try {
    console.log("📧 Running scheduled email report...");
    await sendLoadReportEmail();
    console.log("✅ Scheduled email report sent successfully.");
  } catch (error) {
    console.error("❌ Failed to send scheduled email report:", error);
  }
});
