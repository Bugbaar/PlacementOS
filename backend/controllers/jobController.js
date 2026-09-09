import Job from '../models/Job.js';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public / Protected
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching jobs',
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public / Protected
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opportunity not found',
      });
    }
    return res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Get job by id error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching job details',
    });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Admin)
export const createJob = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      description,
      location,
      salary,
      requiredSkills,
      minimumCGPA,
      deadline,
    } = req.body;

    if (!companyName || !jobTitle || !description || !location || !salary || minimumCGPA === undefined || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide companyName, jobTitle, description, location, salary, minimumCGPA, and deadline',
      });
    }

    if (minimumCGPA < 0 || minimumCGPA > 10) {
      return res.status(400).json({
        success: false,
        message: 'Minimum CGPA must be between 0 and 10',
      });
    }

    const formattedSkills = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const job = await Job.create({
      companyName,
      jobTitle,
      description,
      location,
      salary,
      requiredSkills: formattedSkills,
      minimumCGPA: Number(minimumCGPA),
      deadline: new Date(deadline),
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating job posting',
    });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Admin)
export const updateJob = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      description,
      location,
      salary,
      requiredSkills,
      minimumCGPA,
      deadline,
    } = req.body;

    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (companyName) job.companyName = companyName;
    if (jobTitle) job.jobTitle = jobTitle;
    if (description) job.description = description;
    if (location) job.location = location;
    if (salary) job.salary = salary;
    if (minimumCGPA !== undefined) job.minimumCGPA = Number(minimumCGPA);
    if (deadline) job.deadline = new Date(deadline);
    if (requiredSkills !== undefined) {
      job.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : typeof requiredSkills === 'string'
        ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }

    await job.save();

    return res.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating job posting',
    });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    await job.deleteOne();

    return res.json({
      success: true,
      message: 'Job deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error deleting job posting',
    });
  }
};
