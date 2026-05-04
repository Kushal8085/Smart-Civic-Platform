const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  verifyOTP, 
  resetPassword 
} = require("../controllers/authController");
const { googleLogin } = require("../controllers/googleAuthController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

router.post("/google", googleLogin);

module.exports = router;