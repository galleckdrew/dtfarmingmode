// trackedHoursStore.js
const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'trackedHours.json');

let tractorFarmStartHours = {};

// Load trackedHours from file if it exists
if (fs.existsSync(FILE_PATH)) {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    tractorFarmStartHours = JSON.parse(data) || {};
    console.log("✅ Loaded tracked hours from file");
  } catch (err) {
    console.error("❌ Failed to load tracked hours:", err);
  }
}

// Save trackedHours to file
function saveTrackedHours() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(tractorFarmStartHours, null, 2));
}

module.exports = { tractorFarmStartHours, saveTrackedHours };
