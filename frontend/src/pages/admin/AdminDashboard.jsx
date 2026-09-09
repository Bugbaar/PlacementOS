import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle2,
  Plus,
  ArrowRight,
  Shield,
  Building2,
} from 'lucide-react';
import Modal from '../../components/Modal';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalSelected: 0,
  });
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for adding job
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    companyName: '',
    jobTitle: '',
    description: '',
    location: '',
    salary: '',
    requiredSkills: '',
    minimumCGPA: '6.0',
    deadline: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications'),
        api.get('/jobs'),
      ]);

      if (appsRes.success) {
        setApplications(appsRes.data.applications);
        setStats(appsRes.data.stats);
      }
      if (jobsRes.success) {
        setJobs(jobsRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post('/jobs', newJob);
      if (res.success) {
        setIsAddJobOpen(false);
        setNewJob({
          companyName: '',
          jobTitle: '',
          description: '',
          location: '',
          salary: '',
          requiredSkills: '',
          minimumCGPA: '6.0',
          deadline: '',
        });
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create job');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Placement Admin Control Center</h1>
            <p className="text-xs text-gray-500">
              Manage placement drives, review candidates, and record selection outcomes
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddJobOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalJobs}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Applications</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalApplications}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Selected</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stats.totalSelected}</h3>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Student Applications</h2>
            <p className="text-xs text-gray-500">Review student eligibility & change recruitment status</p>
          </div>
          <Link
            to="/admin/applications"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No student applications recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Company & Job</th>
                  <th className="py-3 px-4">Branch / CGPA</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{app.student?.name || 'Student'}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{app.student?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{app.job?.companyName}</div>
                      <div className="text-[11px] text-blue-600 font-medium">{app.job?.jobTitle}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{app.studentProfile?.branch || 'N/A'}</div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        CGPA: {app.studentProfile?.cgpa ?? 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          app.status === 'Selected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : app.status === 'Shortlisted'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : app.status === 'Rejected'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Selected">Selected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      <Modal isOpen={isAddJobOpen} onClose={() => setIsAddJobOpen(false)} title="Add Placement Opportunity">
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={newJob.companyName}
                onChange={(e) => setNewJob({ ...newJob, companyName: e.target.value })}
                placeholder="Google, TCS, Infosys..."
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={newJob.jobTitle}
                onChange={(e) => setNewJob({ ...newJob, jobTitle: e.target.value })}
                placeholder="Software Engineer, Java Developer..."
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Location *
              </label>
              <input
                type="text"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                placeholder="Bengaluru, Hybrid, Remote"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Offered CTC / Salary *
              </label>
              <input
                type="text"
                value={newJob.salary}
                onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                placeholder="7.5 LPA"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Minimum CGPA Criteria (0 - 10) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={newJob.minimumCGPA}
                onChange={(e) => setNewJob({ ...newJob, minimumCGPA: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                value={newJob.deadline}
                onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Required Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              value={newJob.requiredSkills}
              onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
              placeholder="Java, Spring Boot, MySQL"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Job Description *
            </label>
            <textarea
              rows={3}
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              placeholder="Describe roles & responsibilities..."
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsAddJobOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
