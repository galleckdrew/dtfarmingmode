// emailScheduler.js

const cron = require("node-cron");
const { sendLoadReportEmail } = require("./emailReport");

function startEmailScheduler() {
  // Runs at 9:00 AM EST (which is 13:00 UTC) on the 12th and 28th of each month
  cron.schedule("0 13 12,28 * *", async () => {
    try {
      await sendLoadReportEmail();
      console.log("📧 Monthly report sent successfully!");
    } catch (err) {
      console.error("❌ Failed to send monthly report:", err);
    }
  });
}

module.exports = startEmailScheduler;
