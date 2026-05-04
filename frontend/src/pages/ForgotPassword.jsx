import { useState, useRef, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

function ForgotPassword() {
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "worker") navigate("/worker");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // only allow numbers
    if (value && !/^[0-9]+$/.test(value)) return;

    const newOtpValues = [...otpValues];
    // take only the last character if they somehow enter more
    newOtpValues[index] = value.substring(value.length - 1);
    setOtpValues(newOtpValues);

    // move to next input automatically
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (!pastedData) return;

    const newOtpValues = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      newOtpValues[i] = pastedData[i];
    }
    setOtpValues(newOtpValues);

    // Focus the next empty box, or the last box
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    otpRefs.current[focusIndex].focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpValues.join("");
    if (otp.length !== 6) return toast.error("Please enter the complete 6-digit OTP");

    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      toast.success(res.data.message);
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    const otp = otpValues.join("");
    try {
      const res = await API.post("/auth/reset-password", { email, otp, newPassword });
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {step === 1 ? "Forgot Password" : step === 2 ? "Enter OTP" : "Reset Password"}
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          {step === 1 
            ? "Enter your email to receive a password reset OTP" 
            : step === 2 
            ? `We sent an OTP to ${email}` 
            : "Enter your new password below"}
        </p>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-6">
              <label className="text-sm text-gray-600 mb-3 block text-center font-medium">Enter 6-digit OTP</label>
              <div className="flex justify-center gap-2">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-gray-50 focus:bg-white"
                    disabled={loading}
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 mb-3"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-purple-600 font-medium text-sm hover:underline"
            >
              Back to Email
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="text-sm text-gray-600">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                disabled={loading}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered your password?{" "}
            <span
              className="text-purple-600 font-medium cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Login here
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
