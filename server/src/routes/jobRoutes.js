const express = require('express');
const router = express.Router();
const {
  createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), getMyJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), createJob);
router.patch('/:id', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), updateJob);
router.delete('/:id', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), deleteJob);

module.exports = router;