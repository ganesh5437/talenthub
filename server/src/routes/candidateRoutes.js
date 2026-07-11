const express = require('express');
const router = express.Router();
const { updateProfile, getMyProfile, saveJob, getSavedJobs } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('CANDIDATE'), getMyProfile);
router.patch('/me', protect, authorize('CANDIDATE'), updateProfile);
router.post('/save-job', protect, authorize('CANDIDATE'), saveJob);
router.get('/saved-jobs', protect, authorize('CANDIDATE'), getSavedJobs);

module.exports = router;