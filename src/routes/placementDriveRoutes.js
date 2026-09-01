const express = require("express");

const {
  createPlacementDrive,
  getPlacementDrives,
  getPlacementDriveById,
  checkPlacementEligibility,
} = require("../controllers/placementDriveController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getPlacementDrives);

// Student eligibility check
router.get(
  "/:id/eligibility",
  protect,
  authorize("STUDENT"),
  checkPlacementEligibility
);

// Public drive details
router.get("/:id", getPlacementDriveById);

// Recruiter creates a drive
router.post(
  "/",
  protect,
  authorize("RECRUITER", "PLACEMENT_OFFICER", "ADMIN"),
  createPlacementDrive
);

module.exports = router;