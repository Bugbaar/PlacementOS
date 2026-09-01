const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    college: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
      maxlength: [200, "College name cannot exceed 200 characters"],
    },

    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
      maxlength: [100, "Degree cannot exceed 100 characters"],
    },

    branch: {
      type: String,
      required: [true, "Branch is required"],
      trim: true,
      maxlength: [100, "Branch cannot exceed 100 characters"],
    },

    graduationYear: {
      type: Number,
      required: [true, "Graduation year is required"],
      min: [2000, "Graduation year must be valid"],
      max: [2100, "Graduation year must be valid"],
    },

    cgpa: {
      type: Number,
      required: [true, "CGPA is required"],
      min: [0, "CGPA cannot be below 0"],
      max: [10, "CGPA cannot exceed 10"],
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          return skills.length <= 50;
        },
        message: "A student cannot have more than 50 skills",
      },
    },

    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    placementStatus: {
      type: String,
      enum: [
        "OPEN_TO_OPPORTUNITIES",
        "PLACED",
        "NOT_LOOKING",
      ],
      default: "OPEN_TO_OPPORTUNITIES",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);
