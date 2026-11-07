const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { findUserByEmail } = require('./authController');

const COMPANY_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'];

// Company Admin: register a company (links it to the logged-in admin)
const createCompany = async (req, res) => {
  try {
    const { name, description, website } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Company name required' });
    }
    if (req.user.companyId) {
      return res.status(400).json({ message: 'You have already registered a company' });
    }

    const company = await prisma.company.create({
      data: { name: name.trim(), description, website },
    });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { companyId: company.id },
    });

    // Let platform admins know there is a company waiting for approval.
    const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' }, select: { id: true } });
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({ userId: a.id, message: `New company "${company.name}" is waiting for approval` })),
      });
    }

    res.status(201).json({ message: 'Company created, pending approval', company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SuperAdmin: get all companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
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

    if (!COMPANY_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existing = await prisma.company.findUnique({ where: { id }, include: { users: true } });
    if (!existing) return res.status(404).json({ message: 'Company not found' });

    const company = await prisma.company.update({ where: { id }, data: { status } });

    if (existing.users.length) {
      await prisma.notification.createMany({
        data: existing.users.map((u) => ({
          userId: u.id,
          message: `Your company "${company.name}" is now ${status.toLowerCase()}`,
        })),
      });
    }

    res.status(200).json({ message: `Company ${status.toLowerCase()}`, company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single company profile. Members & SuperAdmin see every job; others only published ones.
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const isInsider = req.user.role === 'SUPER_ADMIN' || req.user.companyId === id;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        departments: true,
        jobs: {
          where: isInsider ? undefined : { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { applications: true } } },
        },
      },
    });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Company Admin: create department under company
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Department name required' });
    if (!req.user.companyId) return res.status(400).json({ message: 'Register your company first' });

    const department = await prisma.department.create({
      data: { name: name.trim(), companyId: req.user.companyId },
    });

    res.status(201).json({ message: 'Department created', department });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Company Admin: list recruiters of own company
const getRecruiters = async (req, res) => {
  try {
    if (!req.user.companyId) return res.status(200).json([]);
    const recruiters = await prisma.user.findMany({
      where: { companyId: req.user.companyId, role: 'RECRUITER' },
      select: {
        id: true, name: true, email: true, isBlocked: true, createdAt: true,
        _count: { select: { createdJobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(recruiters);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Company Admin: add a recruiter to own company.
// - New email  -> creates a recruiter account with the given password.
// - Existing recruiter without a company -> links that account to this company.
const addRecruiter = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!req.user.companyId) return res.status(400).json({ message: 'Register your company first' });
    if (!email?.trim()) return res.status(400).json({ message: 'Recruiter email is required' });

    const existing = await findUserByEmail(email);

    if (existing) {
      if (existing.role !== 'RECRUITER') {
        return res.status(400).json({ message: 'This email belongs to a non-recruiter account' });
      }
      if (existing.companyId && existing.companyId !== req.user.companyId) {
        return res.status(400).json({ message: 'This recruiter already belongs to another company' });
      }
      if (existing.companyId === req.user.companyId) {
        return res.status(400).json({ message: 'This recruiter is already in your company' });
      }
      const linked = await prisma.user.update({
        where: { id: existing.id },
        data: { companyId: req.user.companyId },
        select: { id: true, name: true, email: true },
      });
      await prisma.notification.create({
        data: { userId: existing.id, message: 'You have been added as a recruiter to your company. You can now post jobs.' },
      });
      return res.status(200).json({ message: 'Existing recruiter linked to your company', recruiter: linked });
    }

    if (!name?.trim()) return res.status(400).json({ message: 'Recruiter name is required' });
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Temporary password must be at least 6 characters' });
    }

    const recruiter = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 10),
        role: 'RECRUITER',
        companyId: req.user.companyId,
      },
      select: { id: true, name: true, email: true },
    });

    res.status(201).json({ message: 'Recruiter account created', recruiter });
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
  getRecruiters,
  addRecruiter,
};
