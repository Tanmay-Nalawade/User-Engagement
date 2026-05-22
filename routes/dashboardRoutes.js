const express = require("express");
const { loadEngagement } = require("../middleware/loadEngagement");
const { checkIn, getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.use(loadEngagement);

router.post("/check-in", checkIn);
router.get("/dashboard", getDashboard);

module.exports = router;
