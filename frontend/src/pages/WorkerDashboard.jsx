import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiList, FiMapPin, FiCheckCircle,
  FiClock, FiAlertCircle, FiLogOut
} from 'react-icons/fi';

function WorkerDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/complaints/assigned');
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch assigned tasks');
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await API.put(`/complaints/${complaintId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchAssignments(); // Refresh list to reflect new status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (!a.complaint) return false;
    return statusFilter === 'all' || a.complaint.status === statusFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <FiCheckCircle className="text-green-500" />;
      case 'in-progress': return <FiClock className="text-blue-500" />;
      default: return <FiAlertCircle className="text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10 hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">Worker<br />Dashboard</h1>
        </div>
        <div className="flex-1 px-4 space-y-2 mt-4">
          <button
            className="w-full flex items-center px-4 py-3 rounded-xl transition-all bg-emerald-600 text-white shadow-lg"
          >
            <FiList className="mr-3" /> My Tasks
          </button>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
          >
            <FiLogOut className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-emerald-400">Worker Panel</h1>
        <button onClick={handleLogout} className="text-sm bg-slate-800 px-3 py-1.5 rounded-lg text-red-400">Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">My Assigned Tasks</h2>
              <p className="text-slate-500 mt-1">Manage and update the status of complaints assigned to you.</p>
            </div>
            <select
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No tasks found</h3>
              <p className="text-slate-500">You don't have any assignments matching the current filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAssignments.map((assignment) => {
                const c = assignment.complaint;
                if (!c) return null;
                const isOverdue = new Date(assignment.deadline) < new Date() && c.status !== 'resolved';

                return (
                  <div key={assignment._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Status accent border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.status === 'resolved' ? 'bg-green-500' : c.status === 'in-progress' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>

                    {/* Image */}
                    {c.image && (
                      <div className="w-full md:w-64 flex-shrink-0 self-start">
                        <img src={c.image} alt={c.title} className="w-full aspect-[4/3] object-cover rounded-xl shadow-sm border border-slate-200 block" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <h3 className="text-xl font-bold text-slate-800">{c.title}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 capitalize whitespace-nowrap ${getStatusColor(c.status)}`}>
                          {getStatusIcon(c.status)} {c.status}
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm mb-4">{c.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p><span className="font-semibold text-slate-700">Category:</span> <span className="capitalize">{c.category}</span></p>
                        <p className="flex items-center">
                          <span className="font-semibold text-slate-700 flex items-center"><FiMapPin className="mr-1" /> Location:</span>
                          {c.location?.lat && c.location?.lng ? (
                            <a
                              href={`https://www.google.com/maps?q=${c.location.lat},${c.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline truncate ml-1"
                            >
                              {c.location?.address || "View on map"}
                            </a>
                          ) : (
                            <span className="truncate ml-1">{c.location?.address || c.location || "Not provided"}</span>
                          )}
                        </p>

                        <div className="col-span-1 sm:col-span-2 pt-2 mt-2 border-t border-slate-200 flex flex-wrap gap-4 justify-between items-center text-xs">
                          <p className="text-slate-500">Reported by: <span className="font-medium text-slate-700">{c.user?.name}</span></p>
                          <div className={`px-2 py-1 rounded flex items-center gap-1 font-medium ${isOverdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            <FiClock /> Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                            {isOverdue && <span className="ml-1 uppercase text-[10px] font-bold bg-red-500 text-white px-1.5 rounded-sm">Overdue</span>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-slate-700">Update Status:</span>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleUpdateStatus(c._id, 'pending')}
                            disabled={c.status === 'pending'}
                            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors border ${c.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200 opacity-50 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(c._id, 'in-progress')}
                            disabled={c.status === 'in-progress'}
                            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors border ${c.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200 opacity-50 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(c._id, 'resolved')}
                            disabled={c.status === 'resolved'}
                            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors border ${c.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200 opacity-50 cursor-not-allowed' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                          >
                            Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;
