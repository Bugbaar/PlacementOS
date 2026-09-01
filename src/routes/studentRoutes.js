const express = require("express");

const {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
} = require("../controllers/studentController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorize("STUDENT"),
  createStudentProfile
);

router.get(
  "/profile",
  protect,
  authorize("STUDENT"),
  getStudentProfile
);

router.put(
  "/profile",
  protect,
  authorize("STUDENT"),
  updateStudentProfile
);

module.exports = router;