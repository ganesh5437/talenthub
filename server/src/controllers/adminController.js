const prisma = require('../config/db');

// SuperAdmin: get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, isBlocked: true, createdAt: true,
        company: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SuperAdmin: block/unblock user
const toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot block your own account' });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'SUPER_ADMIN') {
      return res.status(400).json({ message: 'Super admins cannot be blocked' });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked },
      select: { id: true, name: true, email: true, role: true, isBlocked: true },
    });
    res.status(200).json({ message: `User ${updated.isBlocked ? 'blocked' : 'unblocked'}`, user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Platform-wide stats (SuperAdmin dashboard)
const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalCompanies, totalJobs, totalApplications, totalHired] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'HIRED' } }),
    ]);

    res.status(200).json({ totalUsers, totalCompanies, totalJobs, totalApplications, totalHired });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter/Company dashboard stats
const getCompanyStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(200).json({ totalJobs: 0, activeJobs: 0, totalApplications: 0, hired: 0 });
    }

    const [totalJobs, activeJobs, totalApplications, hired] = await Promise.all([
      prisma.job.count({ where: { companyId } }),
      prisma.job.count({ where: { companyId, status: 'PUBLISHED' } }),
      prisma.application.count({ where: { job: { companyId } } }),
      prisma.application.count({ where: { job: { companyId }, status: 'HIRED' } }),
    ]);

    res.status(200).json({ totalJobs, activeJobs, totalApplications, hired });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, toggleBlockUser, getPlatformStats, getCompanyStats };