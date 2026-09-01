const express = require("express");

const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getCompanies);
router.get("/:id", getCompanyById);

// Protected routes
router.post(
  "/",
  protect,
  authorize("RECRUITER", "PLACEMENT_OFFICER", "ADMIN"),
  createCompany
);

router.put(
  "/:id",
  protect,
  authorize("RECRUITER", "PLACEMENT_OFFICER", "ADMIN"),
  updateCompany
);

router.delete(
  "/:id",
  protect,
  authorize("RECRUITER", "PLACEMENT_OFFICER", "ADMIN"),
  deleteCompany
);

module.exports = router;