const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  getAssignedComplaints,
  getAnalytics
} = require("../controllers/complaintController");

const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");

// USER
router.post("/", protect, upload.single("image"), createComplaint);
router.get("/my", protect, getMyComplaints);

// ADMIN
router.get("/", protect, authorize("admin"), getAllComplaints);

// ADMIN + WORKER
router.put("/:id/status", protect, authorize("admin", "worker"), updateComplaintStatus);

// ADMIN ONLY
router.post("/:id/assign", protect, authorize("admin"), assignComplaint);

// Worker only
router.get("/assigned", protect, authorize("worker"), getAssignedComplaints);

router.get("/analytics", protect, authorize("admin"), getAnalytics);

module.exports = router;