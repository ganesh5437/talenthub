const express = require('express');
const router = express.Router();
const {
  applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('CANDIDATE'), applyToJob);
router.get('/my', protect, authorize('CANDIDATE'), getMyApplications);
router.get('/job/:jobId', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), getJobApplicants);
router.patch('/:id/status', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), updateApplicationStatus);

module.exports = router;