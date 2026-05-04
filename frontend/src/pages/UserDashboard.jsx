import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { FiPlus, FiClock, FiCheckCircle, FiActivity, FiMapPin, FiCalendar, FiBox, FiLogOut } from "react-icons/fi";

function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await API.get("/complaints/my");
        setComplaints(res.data);
      } catch (error) {
        toast.error("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "pending").length;
  const inProgress = complaints.filter(c => c.status === "in-progress").length;
  const resolved = complaints.filter(c => c.status === "resolved").length;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "road": return "🛣️";
      case "water": return "💧";
      case "garbage": return "🗑️";
      case "electricity": return "⚡";
      default: return "📌";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              My Dashboard
            </h1>
            <p className="text-indigo-100 mt-1 text-sm font-medium">
              Track and manage your civic complaints
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/create")}
              className="flex items-center bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <FiPlus className="mr-2" /> New Complaint
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center bg-indigo-800/40 text-white hover:bg-red-500/90 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all border border-indigo-400/30 backdrop-blur-sm"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Complaints", value: total, icon: <FiBox />, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Pending", value: pending, icon: <FiClock />, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "In Progress", value: inProgress, icon: <FiActivity />, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Resolved", value: resolved, icon: <FiCheckCircle />, color: "text-emerald-500", bg: "bg-emerald-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
                <h3 className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Complaints List Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
                  <FiBox className="text-2xl text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No complaints yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  You haven't filed any complaints. When you do, they will appear here.
                </p>
                <button
                  onClick={() => navigate("/create")}
                  className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800"
                >
                  <FiPlus className="mr-1" /> File your first complaint
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.map((c) => (
                  <div
                    key={c._id}
                    className="group border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all bg-white relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-start mb-4 mt-2">
                      <div className="text-2xl mr-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {getCategoryIcon(c.category)}
                      </div>
                      <div className="pr-16">
                        <h4 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {c.title}
                        </h4>
                        <div className="flex items-center text-xs text-slate-500 mt-1 font-medium">
                          <FiCalendar className="mr-1.5" />
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
                      {c.description}
                    </p>

                    <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <FiMapPin className="mr-2 text-indigo-400 text-base flex-shrink-0" />
                      {c.location?.lat && c.location?.lng ? (
                        <a
                          href={`https://www.google.com/maps?q=${c.location.lat},${c.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                          title="View on Google Maps"
                        >
                          {c.location?.address || "Location not provided"}
                        </a>
                      ) : (
                        <span className="truncate">
                          {c.location?.address || c.location || "Location not provided"}
                        </span>
                      )}
                    </div>

                    {c.image && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <img
                          src={c.image}
                          alt="Complaint"
                          className="w-full aspect-[4/3] object-cover rounded-xl shadow-sm border border-slate-200 block"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;