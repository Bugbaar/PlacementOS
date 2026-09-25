const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'rejected', 'hired'],
      default: 'applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// A student can only apply once to a given job
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
// Fast "all applicants for this job" lookups, newest first
applicationSchema.index({ jobId: 1, appliedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
