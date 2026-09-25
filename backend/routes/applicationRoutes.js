const express = require('express');
const router = express.Router();
const {
  createApplication,
  updateApplicationStatus,
} = require('../controllers/applicationController');

router.post('/', createApplication);
router.patch('/:id/status', updateApplicationStatus);

module.exports = router;
