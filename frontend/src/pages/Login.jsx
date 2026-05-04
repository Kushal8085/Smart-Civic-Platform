import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import API from "../api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";


function Login() {
  const { login, user } = useContext(AuthContext);
  const googleBtnRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "worker") navigate("/worker");
      else navigate("/dashboard");
    }
  }, [user, navigate]);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      toast.success("Login successful");
      setForm({ email: "", password: "" });
      const role = res.data.role
      if (role === "admin") navigate("/admin");
      else if (role === "worker") navigate("/worker");
      else navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Sign In
        </h2>

        <p className="text-center text-gray-400 text-sm mb-6">
          Welcome back! Please enter your details
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>

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
                placeholder="Enter password"
                value={form.password}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={handleChange}
              />

              {/* Eye icon */}
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Forgot password */}
          <p 
            onClick={() => navigate('/forgot-password')}
            className="text-right text-sm text-purple-600 cursor-pointer mb-4 font-medium hover:underline"
          >
            Forgot password?
          </p>

          {/* Login Button */}
          <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg font-semibold hover:opacity-90">
            Sign In
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
          <span className="font-medium text-gray-700">Google</span>
        </button>

        {/* Signup redirect */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <span
            className="text-purple-600 font-medium cursor-pointer"
            onClick={() => navigate("/")}
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;