import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Briefcase,
  Search,
  MapPin,
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  Building2,
  Filter,
} from 'lucide-react';

const StudentJobs = () => {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobsAndApps = async () => {
      try {
        setLoading(true);
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications/my'),
        ]);

        if (jobsRes.success) setJobs(jobsRes.data);
        if (appsRes.success) setApplications(appsRes.data);
      } catch (err) {
        console.error('Error fetching jobs:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndApps();
  }, []);

  const studentCGPA = profile?.cgpa || 0;

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    return (
      job.jobTitle?.toLowerCase().includes(term) ||
      job.companyName?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term) ||
      (job.requiredSkills && job.requiredSkills.some((s) => s.toLowerCase().includes(term)))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Placement Opportunities</h1>
          <p className="text-xs text-gray-500">
            Browse active hiring drives and verify your eligibility criteria before applying
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, title, skill..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No Jobs Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No active job drives match your current search query. Try searching with different keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = applications.some(
              (app) => app.job?._id === job._id || app.job === job._id
            );
            const isEligible = studentCGPA >= job.minimumCGPA;

            return (
              <div
                key={job._id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">
                          {job.jobTitle}
                        </h3>
                        <p className="text-xs font-semibold text-gray-600">{job.companyName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Badge */}
                  <div>
                    {isEligible ? (
                      <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Eligible (CGPA: {studentCGPA} ≥ Min {job.minimumCGPA})
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                        Ineligible (Requires Min {job.minimumCGPA} CGPA)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Key Info */}
                  <div className="space-y-1.5 pt-2 text-xs text-gray-600 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-gray-800">{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-gray-100">
                  {hasApplied ? (
                    <div className="w-full text-center py-2.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200">
                      ✓ Already Applied
                    </div>
                  ) : (
                    <Link
                      to={`/student/jobs/${job._id}`}
                      className="w-full block text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
                    >
                      View Details & Apply
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentJobs;
