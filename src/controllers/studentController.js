const StudentProfile = require("../models/StudentProfile");

// @desc    Create student profile
// @route   POST /api/v1/students/profile
// @access  Private (Student)
const createStudentProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "STUDENT") {
      res.status(403);
      throw new Error(
        "Only students can create a student profile."
      );
    }

    const existingProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      res.status(409);
      throw new Error(
        "Student profile already exists. Use the update endpoint."
      );
    }

    const {
      college,
      degree,
      branch,
      graduationYear,
      cgpa,
      skills,
      resumeUrl,
      githubUrl,
      linkedinUrl,
    } = req.body;

    const studentProfile = await StudentProfile.create({
      user: req.user._id,
      college,
      degree,
      branch,
      graduationYear,
      cgpa,
      skills,
      resumeUrl,
      githubUrl,
      linkedinUrl,
    });

    res.status(201).json({
      success: true,
      message: "Student profile created successfully.",
      data: {
        studentProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's profile
// @route   GET /api/v1/students/profile
// @access  Private (Student)
const getStudentProfile = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!studentProfile) {
      res.status(404);
      throw new Error("Student profile not found.");
    }

    res.status(200).json({
      success: true,
      data: {
        studentProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student's profile
// @route   PUT /api/v1/students/profile
// @access  Private (Student)
const updateStudentProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "STUDENT") {
      res.status(403);
      throw new Error(
        "Only students can update a student profile."
      );
    }

    const allowedFields = [
      "college",
      "degree",
      "branch",
      "graduationYear",
      "cgpa",
      "skills",
      "resumeUrl",
      "githubUrl",
      "linkedinUrl",
      "placementStatus",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const studentProfile =
      await StudentProfile.findOneAndUpdate(
        {
          user: req.user._id,
        },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!studentProfile) {
      res.status(404);
      throw new Error(
        "Student profile not found. Create one first."
      );
    }

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully.",
      data: {
        studentProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
};