const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getWorkers, createWorker } = require("../controllers/workerController");


router.get("/workers", protect, authorize("admin"), getWorkers);

// Only admin can create worker
router.post("/create-worker", protect, authorize("admin"), createWorker);
module.exports = router;