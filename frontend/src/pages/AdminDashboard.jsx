import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiPieChart, FiList, FiUsers, FiMapPin, FiCheckCircle,
  FiClock, FiAlertCircle, FiLogOut, FiUserPlus, FiFilter
} from 'react-icons/fi';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Worker Form
  const [workerForm, setWorkerForm] = useState({ name: '', email: '', password: '' });
  const [isCreatingWorker, setIsCreatingWorker] = useState(false);

  // Assignment
  const [assignmentData, setAssignmentData] = useState({ workerId: '', deadline: '' });
  const [activeAssignId, setActiveAssignId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await API.get('/complaints/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'complaints') {
        const [compRes, workRes] = await Promise.all([
          API.get('/complaints'),
          API.get('/users/workers')
        ]);
        setComplaints(compRes.data);
        setWorkers(workRes.data);
      } else if (activeTab === 'workers') {
        const res = await API.get('/users/workers');
        setWorkers(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
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

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/create-worker', workerForm);
      toast.success('Worker created successfully');
      setWorkerForm({ name: '', email: '', password: '' });
      setIsCreatingWorker(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create worker');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.put(`/complaints/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignWorker = async (complaintId) => {
    if (!assignmentData.workerId || !assignmentData.deadline) {
      toast.error("Please select a worker and deadline");
      return;
    }
    try {
      await API.post(`/complaints/${complaintId}/assign`, assignmentData);
      toast.success('Worker assigned successfully');
      setActiveAssignId(null);
      setAssignmentData({ workerId: '', deadline: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign worker');
    }
  };

  const filteredComplaints = complaints.filter(c => {
    return (statusFilter === 'all' || c.status === statusFilter) &&
      (categoryFilter === 'all' || c.category === categoryFilter);
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
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">Admin<br />Dashboard</h1>
        </div>
        <div className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <FiPieChart className="mr-3" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'complaints' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <FiList className="mr-3" /> Manage Complaints
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'workers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <FiUsers className="mr-3" /> Manage Workers
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

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="bg-slate-800 border-none rounded-lg text-sm p-2 outline-none"
        >
          <option value="overview">Analytics</option>
          <option value="complaints">Complaints</option>
          <option value="workers">Workers</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && analytics && (
                <div className="space-y-6 animation-fade-in">
                  <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                      <div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl">
                        <FiList className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Complaints</p>
                        <p className="text-3xl font-black text-slate-800">{analytics.total}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Status Breakdown</h3>
                      <div className="space-y-4 mt-4">
                        {analytics.statusStats.length === 0 && <p className="text-slate-500">No data available.</p>}
                        {analytics.statusStats.map(stat => (
                          <div key={stat._id} className="flex justify-between items-center">
                            <span className="capitalize font-medium text-slate-600 flex items-center">
                              {getStatusIcon(stat._id)} <span className="ml-2">{stat._id}</span>
                            </span>
                            <span className="font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">{stat.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Category Breakdown</h3>
                      <div className="space-y-4 mt-4">
                        {analytics.categoryStats.length === 0 && <p className="text-slate-500">No data available.</p>}
                        {analytics.categoryStats.map(stat => (
                          <div key={stat._id} className="flex justify-between items-center">
                            <span className="capitalize font-medium text-slate-600">{stat._id}</span>
                            <span className="font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">{stat.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- COMPLAINTS TAB --- */}
              {activeTab === 'complaints' && (
                <div className="space-y-6 animation-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Manage Complaints</h2>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <select
                          className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <select
                        className="px-4 py-2 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        <option value="road">Road</option>
                        <option value="water">Water</option>
                        <option value="garbage">Garbage</option>
                        <option value="electricity">Electricity</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {filteredComplaints.length === 0 ? (
                      <div className="bg-white p-10 rounded-2xl text-center border border-slate-100 shadow-sm">
                        <p className="text-slate-500">No complaints found matching your filters.</p>
                      </div>
                    ) : (
                      filteredComplaints.map(c => (
                        <div key={c._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                          {/* Image */}
                          {c.image && (
                            <div className="w-full md:w-64 flex-shrink-0 self-start">
                              <img src={c.image} alt={c.title} className="w-full aspect-[4/3] object-cover rounded-xl shadow-sm border border-slate-200" />
                            </div>
                          )}

                          {/* Details */}
                          <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-slate-800">{c.title}</h3>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 capitalize ${getStatusColor(c.status)}`}>
                                {getStatusIcon(c.status)} {c.status}
                              </span>
                            </div>

                            <p className="text-slate-600 text-sm mb-4 flex-1">{c.description}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p><span className="font-semibold text-slate-700">User:</span> {c.user?.name} ({c.user?.email})</p>
                              <p className="capitalize"><span className="font-semibold text-slate-700">Category:</span> {c.category}</p>
                              <p className="col-span-1 sm:col-span-2 flex items-center">
                                <span className="font-semibold text-slate-700 mr-1 flex items-center"><FiMapPin className="mr-1" /> Location:</span>
                                {c.location?.lat && c.location?.lng ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${c.location.lat},${c.location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline truncate ml-1"
                                  >
                                    {c.location?.address || "View on map"}
                                  </a>
                                ) : (
                                  <span className="truncate ml-1">{c.location?.address || c.location || "Not provided"}</span>
                                )}
                              </p>
                              <p className="col-span-1 sm:col-span-2 text-xs mt-1 text-slate-400">Filed on: {new Date(c.createdAt).toLocaleDateString()}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-slate-100">

                              {/* Assignments Info */}
                              {c.assignments && c.assignments.length > 0 && (
                                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 text-sm">
                                  <p className="font-semibold text-indigo-800 mb-2 flex items-center gap-1">
                                    <FiUsers /> Assigned Workers:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {c.assignments.map(a => (
                                      <span key={a._id} className="bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium flex items-center shadow-sm">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-1.5 text-[10px]">
                                          {a.assignedTo?.name?.charAt(0).toUpperCase() || 'W'}
                                        </div>
                                        {a.assignedTo?.name || 'Unknown'} <span className="ml-1 opacity-70">(Due: {new Date(a.deadline).toLocaleDateString()})</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center">
                                  <span className="text-sm font-semibold mr-2 text-slate-700">Status:</span>
                                  <select
                                    value={c.status}
                                    onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                                    className="text-sm border border-slate-200 rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                  </select>
                                </div>

                                {c.status !== 'resolved' && (
                                  <div className="flex-1 min-w-[200px]">
                                    {activeAssignId === c._id ? (
                                      <div className="flex gap-2 items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                        <select
                                          className="text-sm p-1.5 rounded border border-indigo-200 flex-1 outline-none"
                                          value={assignmentData.workerId}
                                          onChange={(e) => setAssignmentData({ ...assignmentData, workerId: e.target.value })}
                                        >
                                          <option value="">Select Worker</option>
                                          {workers.map(w => (
                                            <option key={w._id} value={w._id}>{w.name}</option>
                                          ))}
                                        </select>
                                        <input
                                          type="date"
                                          className="text-sm p-1.5 rounded border border-indigo-200 outline-none"
                                          value={assignmentData.deadline}
                                          onChange={(e) => setAssignmentData({ ...assignmentData, deadline: e.target.value })}
                                        />
                                        <button
                                          onClick={() => handleAssignWorker(c._id)}
                                          className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-indigo-700"
                                        >
                                          Assign
                                        </button>
                                        <button
                                          onClick={() => setActiveAssignId(null)}
                                          className="text-slate-500 text-xs hover:text-slate-700"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setActiveAssignId(c._id)}
                                        className="text-sm bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                      >
                                        {c.assignments && c.assignments.length > 0 ? "Assign Another Worker" : "Assign to Worker"}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* --- WORKERS TAB --- */}
              {activeTab === 'workers' && (
                <div className="space-y-6 animation-fade-in">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Manage Workers</h2>
                    <button
                      onClick={() => setIsCreatingWorker(!isCreatingWorker)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-md"
                    >
                      <FiUserPlus className="mr-2" /> {isCreatingWorker ? 'Cancel' : 'Add Worker'}
                    </button>
                  </div>

                  {isCreatingWorker && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 mb-6">
                      <h3 className="text-lg font-bold mb-4 text-indigo-900 border-b pb-2">Create New Worker Account</h3>
                      <form onSubmit={handleCreateWorker} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                          <input
                            type="text" required
                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={workerForm.name} onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                          <input
                            type="email" required
                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={workerForm.email} onChange={e => setWorkerForm({ ...workerForm, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                          <input
                            type="password" required minLength="6"
                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={workerForm.password} onChange={e => setWorkerForm({ ...workerForm, password: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-3 flex justify-end mt-2">
                          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">
                            Save Worker
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {workers.length === 0 ? (
                          <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No workers registered yet.</td></tr>
                        ) : (
                          workers.map((worker) => (
                            <tr key={worker._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">
                                    {worker.name.charAt(0).toUpperCase()}
                                  </div>
                                  {worker.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{worker.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                  Worker
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animation-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

export default AdminDashboard;
