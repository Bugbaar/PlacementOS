import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Student)
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Fetch student profile
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your student profile before applying.',
      });
    }

    // Eligibility check
    const studentCGPA = profile.cgpa || 0;
    if (studentCGPA < job.minimumCGPA) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for this job.',
        data: {
          studentCGPA,
          minimumCGPA: job.minimumCGPA,
        },
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      student: req.user._id,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    const application = await Application.create({
      student: req.user._id,
      job: jobId,
      status: 'Applied',
      appliedAt: new Date(),
    });

    const populatedApp = await Application.findById(application._id)
      .populate('job')
      .populate('student', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApp,
    });
  } catch (error) {
    console.error('Apply job error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error applying for job',
    });
  }
};

// @desc    Get logged in student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching your applications',
    });
  }
};

// @desc    Get all applications (Admin) with stats
// @route   GET /api/applications
// @access  Private (Admin)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email')
      .populate('job')
      .sort({ createdAt: -1 });

    // Populate student profiles alongside users
    const studentUserIds = applications.map((app) => app.student?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ user: { $in: studentUserIds } });
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enrichedApplications = applications.map((app) => {
      const appObj = app.toObject();
      if (appObj.student?._id) {
        appObj.studentProfile = profileMap[appObj.student._id.toString()] || null;
      }
      return appObj;
    });

    // Admin dashboard counters
    const totalStudents = await User.countDocuments({ role: 'STUDENT' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = applications.length;
    const totalSelected = applications.filter((app) => app.status === 'Selected').length;

    return res.json({
      success: true,
      data: {
        applications: enrichedApplications,
        stats: {
          totalStudents,
          totalJobs,
          totalApplications,
          totalSelected,
        },
      },
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching applications',
    });
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/applications/:id/status
// @access  Private (Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.status = status;
    await application.save();

    const updatedApp = await Application.findById(application._id)
      .populate('student', 'name email')
      .populate('job');

    return res.json({
      success: true,
      message: `Application status updated to '${status}'`,
      data: updatedApp,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating application status',
    });
  }
};
