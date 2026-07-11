const express = require('express');
const router = express.Router();
const {
  getAllUsers, toggleBlockUser, getPlatformStats, getCompanyStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/users', protect, authorize('SUPER_ADMIN'), getAllUsers);
router.patch('/users/:id/block', protect, authorize('SUPER_ADMIN'), toggleBlockUser);
router.get('/stats/platform', protect, authorize('SUPER_ADMIN'), getPlatformStats);
router.get('/stats/company', protect, authorize('COMPANY_ADMIN', 'RECRUITER'), getCompanyStats);

module.exports = router;