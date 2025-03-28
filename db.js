require("dotenv").config(); // Load .env file

const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env file");
    process.exit(1); // Exit if no MongoDB URI is found
}

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));
