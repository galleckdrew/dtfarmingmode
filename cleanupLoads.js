const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connected to MongoDB");
  cleanupBadLoads();
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Load model
const Load = require("./models/Load");

// Delete loads without createdAt
async function cleanupBadLoads() {
  try {
    const result = await Load.deleteMany({ createdAt: { $exists: false } });
    console.log(`🧹 Deleted ${result.deletedCount} loads missing createdAt`);
  } catch (err) {
    console.error("❌ Error deleting loads:", err);
  } finally {
    mongoose.connection.close();
  }
}
