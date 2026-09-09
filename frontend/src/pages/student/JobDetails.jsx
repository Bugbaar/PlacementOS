import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  Send,
  Award,
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get('/applications/my'),
        ]);

        if (jobRes.success) {
          setJob(jobRes.data);
        }

        if (appsRes.success) {
          const applied = appsRes.data.some((a) => a.job?._id === id || a.job === id);
          setHasApplied(applied);
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.message || 'Job not found' });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const studentCGPA = profile?.cgpa || 0;
  const minimumCGPA = job?.minimumCGPA || 0;
  const isEligible = studentCGPA >= minimumCGPA;

  const handleApply = async () => {
    setMessage({ type: '', text: '' });

    if (!profile || !profile.cgpa) {
      setMessage({
        type: 'error',
        text: 'Please complete your student profile and set your CGPA before applying.',
      });
      return;
    }

    if (!isEligible) {
      setMessage({ type: 'error', text: 'You are not eligible for this job.' });
      return;
    }

    try {
      setApplying(true);
      const response = await api.post('/applications', { jobId: id });
      if (response.success) {
        setHasApplied(true);
        setMessage({
          type: 'success',
          text: 'Application submitted successfully! Redirecting to applications page...',
        });
        setTimeout(() => {
          navigate('/student/applications');
        }, 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Application failed' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white rounded-2xl p-8 border text-center space-y-4 max-w-lg mx-auto mt-10">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold">Job Not Found</h2>
        <Link to="/student/jobs" className="text-blue-600 text-sm font-semibold hover:underline">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/student/jobs"
        className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-xl transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to Jobs</span>
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{job.jobTitle}</h1>
              <p className="text-sm font-medium text-gray-300">{job.companyName}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-gray-400 block uppercase tracking-wider">Offered CTC</span>
            <span className="text-xl font-extrabold text-emerald-400">{job.salary}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {message.text && (
            <div
              className={`p-4 rounded-xl text-sm flex items-center space-x-3 border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Eligibility Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isEligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-start space-x-3">
              {isEligible ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {isEligible ? 'You are eligible for this job!' : 'You are not eligible for this job.'}
                </h4>
                <p className="text-xs mt-0.5 opacity-90">
                  Your CGPA is <span className="font-bold">{studentCGPA}</span>. Minimum required CGPA is{' '}
                  <span className="font-bold">{minimumCGPA}</span>.
                </p>
              </div>
            </div>

            {!isEligible && (
              <Link
                to="/student/profile"
                className="text-xs font-semibold text-red-700 underline hover:text-red-800 whitespace-nowrap"
              >
                Update Profile CGPA
              </Link>
            )}
          </div>

          {/* Job Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Location</span>
                <span className="text-sm font-bold text-gray-800">{job.location}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Min CGPA</span>
                <span className="text-sm font-bold text-gray-800">{job.minimumCGPA} / 10.0</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Deadline</span>
                <span className="text-sm font-bold text-gray-800">
                  {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Job Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-gray-100">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Required Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Action Button */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {hasApplied
                ? 'Status: Application Submitted'
                : isEligible
                ? 'Ready to apply with your current profile'
                : 'Criteria mismatch'}
            </span>

            {hasApplied ? (
              <button
                disabled
                className="px-6 py-3 bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-sm cursor-not-allowed flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Application Submitted</span>
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={!isEligible || applying}
                className={`px-8 py-3 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center space-x-2 ${
                  isEligible && !applying
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{applying ? 'Submitting Application...' : 'Apply for Job'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
