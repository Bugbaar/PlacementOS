import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    salary: {
      type: String,
      required: [true, 'Salary is required'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    minimumCGPA: {
      type: Number,
      required: [true, 'Minimum CGPA is required'],
      min: 0,
      max: 10,
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
