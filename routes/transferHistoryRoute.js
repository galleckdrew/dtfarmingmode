const express = require("express");
const router = express.Router();
const Transfer = require("../models/Transfer");
const Tractor = require("../models/Tractor");

router.get("/transfer-history", async (req, res) => {
  try {
    const { from, to, tractor } = req.query;

    const query = {};
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to + "T23:59:59");
    }
    if (tractor) query.tractor = tractor;

    const transfers = await Transfer.find(query).populate("tractor").sort({ timestamp: -1 });

    const totalHours = transfers.reduce((sum, t) => sum + (t.totalHours || 0), 0);
    const tractors = await Tractor.find();

    res.render("transfer-history", { transfers, tractors, totalHours, from, to, tractor });
  } catch (err) {
    console.error("❌ Error loading transfer history:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
