const express = require('express');
const router = express.Router();
const {
  createCompany,
  getAllCompanies,
  updateCompanyStatus,
  getCompanyById,
  createDepartment,
  getRecruiters,
  addRecruiter,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('COMPANY_ADMIN'), createCompany);
router.get('/', protect, authorize('SUPER_ADMIN'), getAllCompanies);
router.post('/department', protect, authorize('COMPANY_ADMIN'), createDepartment);
router.get('/me/recruiters', protect, authorize('COMPANY_ADMIN'), getRecruiters);
router.post('/me/recruiters', protect, authorize('COMPANY_ADMIN'), addRecruiter);
router.get('/:id', protect, getCompanyById);
router.patch('/:id/status', protect, authorize('SUPER_ADMIN'), updateCompanyStatus);

module.exports = router;
