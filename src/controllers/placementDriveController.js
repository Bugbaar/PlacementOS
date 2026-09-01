const PlacementDrive = require("../models/PlacementDrive");
const Company = require("../models/Company");
const StudentProfile = require("../models/StudentProfile");
const { checkEligibility } = require("../services/eligibilityService");

// Create placement drive
const createPlacementDrive = async (req, res, next) => {
  try {
    const {
      company,
      title,
      description,
      jobType,
      location,
      package: salaryPackage,
      minimumCgpa,
      eligibleBranches,
      requiredSkills,
      eligibleGraduationYears,
      applicationDeadline,
    } = req.body;

    const companyExists = await Company.findById(company);

    if (!companyExists) {
      res.status(404);
      throw new Error("Company not found.");
    }

    const isOwner =
      companyExists.createdBy.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error(
        "You do not have permission to create a drive for this company."
      );
    }

    const placementDrive = await PlacementDrive.create({
      company,
      title,
      description,
      jobType,
      location,
      package: salaryPackage,
      minimumCgpa,
      eligibleBranches,
      requiredSkills,
      eligibleGraduationYears,
      applicationDeadline,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Placement drive created successfully.",
      data: {
        placementDrive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all placement drives
const getPlacementDrives = async (req, res, next) => {
  try {
    const placementDrives = await PlacementDrive.find()
      .populate("company", "name industry website")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: placementDrives.length,
      data: {
        placementDrives,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get placement drive by ID
const getPlacementDriveById = async (req, res, next) => {
  try {
    const placementDrive = await PlacementDrive.findById(
      req.params.id
    ).populate("company", "name industry website");

    if (!placementDrive) {
      res.status(404);
      throw new Error("Placement drive not found.");
    }

    res.status(200).json({
      success: true,
      data: {
        placementDrive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Check eligibility for a placement drive
const checkPlacementEligibility = async (req, res, next) => {
  try {
    const placementDrive = await PlacementDrive.findById(
      req.params.id
    );

    if (!placementDrive) {
      res.status(404);
      throw new Error("Placement drive not found.");
    }

    const studentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (!studentProfile) {
      res.status(404);
      throw new Error(
        "Student profile not found. Please create your profile first."
      );
    }

    const eligibility = checkEligibility(
      studentProfile,
      placementDrive
    );

    res.status(200).json({
      success: true,
      data: {
        placementDrive: {
          id: placementDrive._id,
          title: placementDrive.title,
        },
        eligibility,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlacementDrive,
  getPlacementDrives,
  getPlacementDriveById,
  checkPlacementEligibility,
};