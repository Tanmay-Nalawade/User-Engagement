const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(200).json({
    status: "ok",
    service: "user-engagement-api",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
