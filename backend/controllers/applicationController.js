const Application = require('../models/Application');

/**
 * POST /api/applications
 * A student applies to a job. (Included so the recruiter portal has
 * real data to display — the student-facing UI is out of scope here.)
 */
exports.createApplication = async (req, res) => {
  try {
    const { jobId, studentId, studentName, studentEmail, resumeUrl } = req.body;

    if (!jobId || !studentId || !studentName || !studentEmail) {
      return res.status(400).json({
        success: false,
        message: 'jobId, studentId, studentName, and studentEmail are required',
      });
    }

    const application = await Application.create({
      jobId,
      studentId,
      studentName,
      studentEmail,
      resumeUrl,
    });

    return res.status(201).json({ success: true, data: application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Student has already applied to this job' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/applications/:id/status
 * Recruiter moves an applicant through the hiring pipeline
 * (applied -> shortlisted -> interview -> hired/rejected).
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['applied', 'shortlisted', 'interview', 'rejected', 'hired'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.status(200).json({ success: true, data: application });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
