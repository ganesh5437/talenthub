const express = require('express');
const router = express.Router();
const {
  createCompany,
  getAllCompanies,
  updateCompanyStatus,
  getCompanyById,
  createDepartment,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createCompany);
router.get('/', protect, authorize('SUPER_ADMIN'), getAllCompanies);
router.get('/:id', protect, getCompanyById);
router.patch('/:id/status', protect, authorize('SUPER_ADMIN'), updateCompanyStatus);
router.post('/department', protect, authorize('COMPANY_ADMIN'), createDepartment);

module.exports = router;