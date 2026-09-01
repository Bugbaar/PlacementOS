const Company = require("../models/Company");

// @desc    Create a company
// @route   POST /api/v1/companies
// @access  Private (Recruiter, Placement Officer, Admin)
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      description,
      website,
      industry,
      headquarters,
      companySize,
    } = req.body;

    const company = await Company.create({
      name,
      description,
      website,
      industry,
      headquarters,
      companySize,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully.",
      data: {
        company,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all companies
// @route   GET /api/v1/companies
// @access  Public
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: companies.length,
      data: {
        companies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company by ID
// @route   GET /api/v1/companies/:id
// @access  Public
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!company) {
      res.status(404);
      throw new Error("Company not found.");
    }

    res.status(200).json({
      success: true,
      data: {
        company,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/v1/companies/:id
// @access  Private (Owner/Admin)
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      res.status(404);
      throw new Error("Company not found.");
    }

    const isOwner =
      company.createdBy.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error(
        "You do not have permission to update this company."
      );
    }

    const allowedFields = [
      "name",
      "description",
      "website",
      "industry",
      "headquarters",
      "companySize",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });

    await company.save();

    res.status(200).json({
      success: true,
      message: "Company updated successfully.",
      data: {
        company,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/v1/companies/:id
// @access  Private (Owner/Admin)
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      res.status(404);
      throw new Error("Company not found.");
    }

    const isOwner =
      company.createdBy.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error(
        "You do not have permission to delete this company."
      );
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: "Company deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
