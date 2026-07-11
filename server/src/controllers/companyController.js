const prisma = require('../config/db');

// Register a company (creates company + links to logged-in user as CompanyAdmin)
const createCompany = async (req, res) => {
  try {
    const { name, description, website } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: 'Company name required' });
    }

    const company = await prisma.company.create({
      data: { name, description, website },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { companyId: company.id, role: 'COMPANY_ADMIN' },
    });

    res.status(201).json({ message: 'Company created, pending approval', company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SuperAdmin: get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: { departments: true, users: true },
    });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SuperAdmin: approve/reject/block company
const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const company = await prisma.company.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ message: `Company ${status.toLowerCase()}`, company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single company profile
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { departments: true, jobs: true },
    });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create department under company
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const companyId = req.user.companyId;

    const department = await prisma.department.create({
      data: { name, companyId },
    });

    res.status(201).json({ message: 'Department created', department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  updateCompanyStatus,
  getCompanyById,
  createDepartment,
};