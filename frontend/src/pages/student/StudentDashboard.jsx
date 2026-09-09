import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Briefcase,
  FileCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Sparkles,
  Building2,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications/my'),
        ]);

        if (jobsRes.success) setJobs(jobsRes.data);
        if (appsRes.success) setApplications(appsRes.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Profile Completion %
  const calculateProfileCompletion = () => {
    if (!profile) return 20; // Name & Email present
    let score = 20;
    if (profile.phone) score += 15;
    if (profile.college) score += 15;
    if (profile.branch) score += 15;
    if (profile.cgpa > 0) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 10;
    if (profile.resumeUrl) score += 10;
    return score;
  };

  const profileScore = calculateProfileCompletion();

  // Application Status Counters
  const totalApplied = applications.length;
  const totalShortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
  const totalSelected = applications.filter((a) => a.status === 'Selected').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Welcome back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Explore placement opportunities, track your ongoing job applications, and keep your academic profile updated.
          </p>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profileScore < 100 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Profile Completion: {profileScore}%
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                {profile?.cgpa ? 'Add remaining details like resume & skills to improve eligibility visibility.' : 'Please update your CGPA to enable eligibility checks for jobs.'}
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center space-x-1 whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5 mr-1" />
            <span>Complete Profile</span>
          </Link>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{jobs.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied Jobs</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalApplied}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shortlisted</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalShortlisted}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Offers</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalSelected}</h3>
          </div>
        </div>
      </div>

      {/* Available Jobs Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Featured Placement Opportunities</h2>
            <p className="text-xs text-gray-500">Apply for positions matching your skill set and CGPA criteria</p>
          </div>
          <Link
            to="/student/jobs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No job postings currently available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.slice(0, 4).map((job) => {
              const hasApplied = applications.some((app) => app.job?._id === job._id || app.job === job._id);
              const isEligible = (profile?.cgpa || 0) >= job.minimumCGPA;

              return (
                <div
                  key={job._id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{job.jobTitle}</h4>
                        <p className="text-xs font-medium text-gray-600">{job.companyName}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {isEligible ? `Eligible (Min ${job.minimumCGPA} CGPA)` : `Requires ${job.minimumCGPA} CGPA`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <span>📍 {job.location}</span>
                    <span className="font-semibold text-gray-700">💰 {job.salary}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    {hasApplied ? (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        ✓ Applied
                      </span>
                    ) : (
                      <Link
                        to={`/student/jobs/${job._id}`}
                        className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        View & Apply
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
