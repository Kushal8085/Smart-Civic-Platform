const Complaint = require("../models/Complaint");
const Assignment = require("../models/Assignment");
const cloudinary = require("../config/cloudinary");

// CREATE COMPLAINT (User)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    let location = {};

    if (req.body.location) {
      try {
        location = JSON.parse(req.body.location);
      } catch {
        location = { address: req.body.location }; // fallback
      }
    }
    
    let imageUrl = "";

    // Upload only if image exists
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "complaints" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        stream.end(req.file.buffer);
      });
    }

    // Always create complaint
    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      description,
      category,
      location,
      image: imageUrl, // "" if no image
    });

    res.status(201).json(complaint);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET MY COMPLAINTS (User)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL COMPLAINTS (Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const complaintIds = complaints.map(c => c._id);
    const assignments = await Assignment.find({ complaint: { $in: complaintIds } })
      .populate("assignedTo", "name email");

    const assignmentsByComplaint = {};
    assignments.forEach(a => {
      const compId = a.complaint.toString();
      if (!assignmentsByComplaint[compId]) {
        assignmentsByComplaint[compId] = [];
      }
      assignmentsByComplaint[compId].push(a);
    });

    const complaintsWithAssignments = complaints.map(c => ({
      ...c,
      assignments: assignmentsByComplaint[c._id.toString()] || []
    }));

    res.json(complaintsWithAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE STATUS (Admin / Worker)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ Check assignment
    const assignment = await Assignment.findOne({
      complaint: req.params.id,
      assignedTo: req.user._id,
    });

    // If worker, must be assigned
    if (req.user.role === "worker" && !assignment) {
      return res.status(403).json({ message: "Not assigned to this complaint" });
    }


    complaint.status = status;
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ASSIGN COMPLAINT (Admin)
exports.assignComplaint = async (req, res) => {
  try {
    const { workerId, deadline } = req.body;

    const existing = await Assignment.findOne({ complaint: req.params.id, assignedTo: workerId });
    if (existing) {
      return res.status(400).json({ message: "Worker is already assigned to this complaint" });
    }

    const assignment = await Assignment.create({
      complaint: req.params.id,
      assignedTo: workerId,
      assignedBy: req.user._id,
      deadline,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAssignedComplaints = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      assignedTo: req.user._id,
    })
      .populate({
        path: "complaint",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();

    const statusStats = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const categoryStats = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      total,
      statusStats,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};