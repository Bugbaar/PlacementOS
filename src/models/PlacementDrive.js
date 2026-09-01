const mongoose = require("mongoose");

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    jobType: {
      type: String,
      enum: ["INTERNSHIP", "FULL_TIME"],
      default: "INTERNSHIP",
    },

    location: {
      type: String,
      required: true,
    },

    package: {
      type: String,
      default: "",
    },

    minimumCgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    eligibleBranches: {
      type: [String],
      default: [],
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    eligibleGraduationYears: {
      type: [Number],
      default: [],
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PlacementDrive",
  placementDriveSchema
);