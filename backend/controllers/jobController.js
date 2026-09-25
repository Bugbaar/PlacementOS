const Job = require('../models/Job');
const Application = require('../models/Application');

/**
 * POST /api/jobs
 * Recruiter creates a new job posting.
 */
exports.createJob = async (req, res) => {
  try {
    const {
      recruiterId,
      title,
      description,
      companyName,
      location,
      employmentType,
      eligibilityCriteria,
      ctc,
      applicationDeadline,
    } = req.body;

    if (!recruiterId || !title || !description || !companyName || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'recruiterId, title, description, companyName, and applicationDeadline are required',
      });
    }

    const job = await Job.create({
      recruiterId,
      title,
      description,
      companyName,
      location,
      employmentType,
      eligibilityCriteria,
      ctc,
      applicationDeadline,
    });

    return res.status(201).json({ success: true, data: job });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/jobs?recruiterId=...&status=...
 * List job postings, optionally filtered by recruiter or status.
 */
exports.getJobs = async (req, res) => {
  try {
    const { recruiterId, status } = req.query;
    const filter = {};
    if (recruiterId) filter.recruiterId = recruiterId;
    if (status) filter.status = status;

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    // Attach a lightweight applicant count per job so the dashboard
    // table doesn't need a second round-trip per row.
    const jobIds = jobs.map((j) => j._id);
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

    const jobsWithCounts = jobs.map((job) => ({
      ...job.toObject(),
      applicantCount: countMap[job._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, data: jobsWithCounts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/jobs/:id
 * Fetch a single job posting.
 */
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/jobs/:id
 * Recruiter edits a job posting or changes its status (e.g. close it).
 */
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/jobs/:id
 * Recruiter removes a job posting.
 */
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/jobs/:id/applications
 * Recruiter views everyone who applied to a specific job posting.
 */
exports.getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applications = await Application.find({ jobId: req.params.id }).sort({
      appliedAt: -1,
    });

    return res.status(200).json({ success: true, data: applications });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
