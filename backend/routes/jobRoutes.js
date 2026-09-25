const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getApplicationsForJob,
} = require('../controllers/jobController');

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.patch('/:id', updateJob);
router.delete('/:id', deleteJob);
router.get('/:id/applications', getApplicationsForJob);

module.exports = router;
