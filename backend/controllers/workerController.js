const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getWorkers = async (req, res) => {
  const workers = await User.find({ role: "worker" }).select("name email");
  res.json(workers);
};

// Admin creates worker
exports.createWorker = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "worker",
    });

    res.status(201).json({
      _id: worker._id,
      name: worker.name,
      email: worker.email,
      role: worker.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};