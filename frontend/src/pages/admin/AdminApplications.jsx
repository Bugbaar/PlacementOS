import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  ExternalLink,
  Award,
} from 'lucide-react';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications');
      if (res.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      app.student?.name?.toLowerCase().includes(term) ||
      app.student?.email?.toLowerCase().includes(term) ||
      app.job?.companyName?.toLowerCase().includes(term) ||
      app.job?.jobTitle?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
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
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
          <p className="text-xs text-gray-500">
            Review applicant qualifications, verify CGPA eligibility, and manage recruitment decisions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-purple-500 shadow-sm"
            >
              <option value="ALL">Filter: All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Selected">Selected</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student or company..."
              className="pl-9 pr-4 py-2 bg-white border rounded-xl text-xs focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No Applications Match Filter</h3>
          <p className="text-xs text-gray-500">Try changing the status filter or search keyword.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Applicant Student</th>
                  <th className="py-3.5 px-4">Job & Company</th>
                  <th className="py-3.5 px-4">College / Branch</th>
                  <th className="py-3.5 px-4">CGPA vs Required</th>
                  <th className="py-3.5 px-4">Resume</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4 text-center">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredApps.map((app) => {
                  const studentCGPA = app.studentProfile?.cgpa ?? 0;
                  const minCGPA = app.job?.minimumCGPA ?? 0;

                  return (
                    <tr key={app._id} className="hover:bg-gray-50/70">
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        <div>{app.student?.name || 'Unknown Student'}</div>
                        <div className="text-[11px] text-gray-400 font-normal">
                          {app.student?.email}
                        </div>
                        {app.studentProfile?.phone && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            📞 {app.studentProfile.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{app.job?.companyName}</div>
                        <div className="text-blue-600 font-medium">{app.job?.jobTitle}</div>
                        <div className="text-[10px] text-gray-400">{app.job?.salary}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-800">
                          {app.studentProfile?.college || 'College N/A'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {app.studentProfile?.branch || 'Branch N/A'} (
                          {app.studentProfile?.graduationYear || 'N/A'})
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="inline-flex items-center space-x-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>
                            {studentCGPA} / Min {minCGPA}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {app.studentProfile?.resumeUrl ? (
                          <a
                            href={app.studentProfile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                          >
                            <span>Resume</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">No Resume</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-gray-500">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            app.status === 'Selected'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : app.status === 'Shortlisted'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : app.status === 'Rejected'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Selected">Selected</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
