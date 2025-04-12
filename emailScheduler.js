const cron = require("node-cron");
const sendLoadReportEmail = require("./emailReport");

// ⏰ Schedule to run at 8:00 AM EST on the 12th and 28th of every month
cron.schedule(
  "0 8 12,28 * *",
  async () => {
    try {
      console.log("📧 Scheduled report sending...");
      await sendLoadReportEmail();
      console.log("✅ Email report sent successfully.");
    } catch (err) {
      console.error("❌ Failed to send scheduled report:", err);
    }
  },
  {
    timezone: "America/New_York",
  }
);
