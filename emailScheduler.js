// emailScheduler.js

const cron = require("node-cron");
const sendLoadReportEmail = require("./emailReport");

function setupEmailScheduler() {
  // Run at 7:00 AM on the 12th and 28th of every month
  cron.schedule("0 7 12,28 * *", () => {
    console.log("📧 Running scheduled email report...");
    sendLoadReportEmail();
  });
}

module.exports = setupEmailScheduler;
