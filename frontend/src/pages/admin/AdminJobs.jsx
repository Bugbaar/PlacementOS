import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  Search,
} from 'lucide-react';
import Modal from '../../components/Modal';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    description: '',
    location: '',
    salary: '',
    requiredSkills: '',
    minimumCGPA: '6.0',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs');
      if (res.success) setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openAddModal = () => {
    setEditingJobId(null);
    setFormData({
      companyName: '',
      jobTitle: '',
      description: '',
      location: '',
      salary: '',
      requiredSkills: '',
      minimumCGPA: '6.0',
      deadline: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJobId(job._id);
    setFormData({
      companyName: job.companyName || '',
      jobTitle: job.jobTitle || '',
      description: job.description || '',
      location: job.location || '',
      salary: job.salary || '',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
      minimumCGPA: job.minimumCGPA ?? 6.0,
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job drive?')) return;

    try {
      const res = await api.delete(`/jobs/${id}`);
      if (res.success) {
        fetchJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingJobId) {
        await api.put(`/jobs/${editingJobId}`, formData);
      } else {
        await api.post('/jobs', formData);
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Error saving job');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    return (
      job.jobTitle?.toLowerCase().includes(term) ||
      job.companyName?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Drives & Jobs</h1>
          <p className="text-xs text-gray-500">
            Add, update, or remove company job opportunities
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drives..."
              className="pl-9 pr-4 py-2 bg-white border rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No Job Opportunities Created</h3>
          <p className="text-xs text-gray-500">Click 'Add Job' to post a new campus hiring drive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:border-purple-200 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{job.jobTitle}</h3>
                    <p className="text-xs font-semibold text-gray-600">{job.companyName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(job)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Edit Job"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2">{job.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold text-gray-800">{job.salary}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-purple-700">Min CGPA: {job.minimumCGPA}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {job.requiredSkills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJobId ? 'Edit Job Drive' : 'Add Placement Drive'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Google, TCS, Infosys"
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
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Software Engineer"
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
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bengaluru"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Offered CTC *
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="7.5 LPA"
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Minimum CGPA (0 - 10) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.minimumCGPA}
                onChange={(e) => setFormData({ ...formData, minimumCGPA: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Required Technical Skills
            </label>
            <input
              type="text"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="Java, Spring Boot, MySQL"
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Job details & requirements..."
              className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminJobs;
