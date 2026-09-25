const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: 'Not specified',
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'internship', 'part-time', 'contract'],
      default: 'full-time',
    },
    eligibilityCriteria: {
      minCgpa: { type: Number, default: 0 },
      allowedBranches: { type: [String], default: [] },
      maxBacklogs: { type: Number, default: null },
    },
    ctc: {
      type: String,
      trim: true,
      default: 'Not disclosed',
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Fast lookups of "all jobs by this recruiter" and "all open jobs"
jobSchema.index({ recruiterId: 1, createdAt: -1 });
jobSchema.index({ status: 1, applicationDeadline: 1 });

module.exports = mongoose.model('Job', jobSchema);
