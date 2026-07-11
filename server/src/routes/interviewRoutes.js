const express = require('express');
const router = express.Router();
const { scheduleInterview, updateInterview } = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), scheduleInterview);
router.patch('/:id', protect, authorize('RECRUITER', 'COMPANY_ADMIN'), updateInterview);

module.exports = router;