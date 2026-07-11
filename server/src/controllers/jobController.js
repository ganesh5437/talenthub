const prisma = require('../config/db');

// Recruiter: create job
const createJob = async (req, res) => {
  try {
    console.log('CREATE JOB BODY:', req.body);
    console.log('CREATE JOB USER:', req.user);
    const {
      title, description, departmentId, categoryId,
      skillsCsv, salaryMin, salaryMax, experience, type, status,
    } = req.body;
    const recruiterId = req.user.userId;
    const companyId = req.user.companyId;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description required' });
    }

    const job = await prisma.job.create({
      data: {
        title, description, companyId, departmentId, categoryId,
        skillsCsv, salaryMin, salaryMax, experience,
        type: type || 'ONSITE',
        status: status || 'DRAFT',
        recruiterId,
      },
    });

    res.status(201).json({ message: 'Job created', job });
 } catch (error) {
    console.error('CREATE JOB ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Public: get all published jobs (with search/filter)
const getJobs = async (req, res) => {
  try {
    const { search, type, category, minSalary } = req.query;

    const where = { status: 'PUBLISHED' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (category) where.categoryId = category;
    if (minSalary) where.salaryMin = { gte: parseInt(minSalary) };

    const jobs = await prisma.job.findMany({
      where,
      include: { company: true, department: true, category: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single job
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: { company: true, department: true, category: true, recruiter: true },
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: update job (edit, publish, close, draft)
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const job = await prisma.job.update({
      where: { id },
      data,
    });

    res.status(200).json({ message: 'Job updated', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.job.delete({ where: { id } });
    res.status(200).json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: get jobs they created
const getMyJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { recruiterId: req.user.userId },
      include: { applications: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs };