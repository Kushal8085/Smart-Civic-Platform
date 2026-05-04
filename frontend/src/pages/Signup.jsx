import { useState, useContext, useRef, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";


function Signup() {
  const { login, user } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "worker") navigate("/worker");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", form);

      // save user + token
      login(res.data);
      setForm({ name: "", email: "", password: "" });

      toast.success("Signup successful");
      const role = res.data.role
      if (role === "admin") navigate("/admin");
      else if (role === "worker") navigate("/worker");
      else navigate("/dashboard");
    } catch (error) {
      console.log(error.response);
      toast.error(error.response?.data?.message || "Error")
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create your account
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Name</label>
            <input
              name="name"
              type="text"
              placeholder="Enter your name"
              value={form.name}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="text-sm text-gray-600">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                value={form.password}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={handleChange}
              />
              {/* Eye Icon */}
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Must be at least 8 characters.
          </p>

          {/* Sign Up Button */}
          <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg font-semibold hover:opacity-90">
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200"></div>
          <span className="mx-2 text-sm text-gray-400">or continue with</span>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>

        {/* 👇 Hidden Google button */}
        <div style={{ display: "none" }} ref={googleBtnRef}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const res = await API.post("/auth/google", {
                  token: credentialResponse.credential,
                });

                login(res.data);
                toast.success("Google login successful");
                const role = res.data.role
                if (role === "admin") navigate("/admin");
                else if (role === "worker") navigate("/worker");
                else navigate("/dashboard");
              } catch {
                toast.error("Google login failed");
              }
            }}
            onError={() => toast.error("Google Signin Failed")}
          />
        </div>

        {/* Google Button */}
        <button onClick={() => {
          document.querySelector("div[role=button]").click();
        }} className="w-full flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-100 transition">
          <FcGoogle size={20} />
          {/* Sign in with Google */}
          <span className="font-medium text-gray-700">Google</span>
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="text-purple-600 font-medium cursor-pointer">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;