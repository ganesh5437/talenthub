const prisma = require('../config/db');
const { canManageJob, notFound, forbidden } = require('../utils/access');

const JOB_TYPES = ['REMOTE', 'HYBRID', 'ONSITE'];
const JOB_STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED'];

const toIntOrNull = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? NaN : n;
};

// Validates and picks only the fields a recruiter is allowed to set on a job.
const buildJobData = (body, { partial }) => {
  const data = {};
  const errors = [];

  for (const key of ['title', 'description', 'skillsCsv', 'experience']) {
    if (body[key] !== undefined) data[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
  }
  if (!partial || body.title !== undefined) {
    if (!data.title) errors.push('Title is required');
  }
  if (!partial || body.description !== undefined) {
    if (!data.description) errors.push('Description is required');
  }

  for (const key of ['salaryMin', 'salaryMax']) {
    if (body[key] !== undefined) {
      const n = toIntOrNull(body[key]);
      if (Number.isNaN(n) || (n !== null && n < 0)) errors.push(`${key} must be a positive number`);
      else data[key] = n;
    }
  }
  if (data.salaryMin != null && data.salaryMax != null && data.salaryMin > data.salaryMax) {
    errors.push('Min salary cannot be greater than max salary');
  }

  if (body.type !== undefined) {
    if (!JOB_TYPES.includes(body.type)) errors.push('Invalid work type');
    else data.type = body.type;
  }
  if (body.status !== undefined) {
    if (!JOB_STATUSES.includes(body.status)) errors.push('Invalid job status');
    else data.status = body.status;
  }

  return { data, errors };
};

const ensureApprovedCompany = async (user) => {
  if (!user.companyId) {
    return user.role === 'COMPANY_ADMIN'
      ? 'Register your company first (Company Dashboard) before posting jobs'
      : 'Your recruiter account is not linked to a company yet. Ask your company admin to add you as a recruiter.';
  }
  const company = await prisma.company.findUnique({ where: { id: user.companyId } });
  if (!company) return 'Company not found';
  if (company.status !== 'APPROVED') {
    return `Your company is ${company.status.toLowerCase()}. Jobs can be posted only after the platform admin approves the company.`;
  }
  return null;
};

// Recruiter: create job
const createJob = async (req, res) => {
  try {
    const companyProblem = await ensureApprovedCompany(req.user);
    if (companyProblem) return res.status(403).json({ message: companyProblem });

    const { data, errors } = buildJobData(req.body, { partial: false });
    if (data.status === 'CLOSED') errors.push('A new job can only be Draft or Published');
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    const job = await prisma.job.create({
      data: {
        ...data,
        type: data.type || 'ONSITE',
        status: data.status || 'DRAFT',
        companyId: req.user.companyId,
        recruiterId: req.user.userId,
      },
    });

    res.status(201).json({ message: 'Job created', job });
  } catch (error) {
    console.error('CREATE JOB ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Public: get all published jobs from approved companies (with search/filter)
const getJobs = async (req, res) => {
  try {
    const { search, type, category, minSalary } = req.query;

    const where = { status: 'PUBLISHED', company: { status: 'APPROVED' } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skillsCsv: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (type && JOB_TYPES.includes(type)) where.type = type;
    if (category) where.categoryId = category;
    if (minSalary && !Number.isNaN(parseInt(minSalary, 10))) {
      where.salaryMax = { gte: parseInt(minSalary, 10) };
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, website: true } },
        department: true,
        category: true,
      },
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
      include: {
        company: { select: { id: true, name: true, website: true, description: true } },
        department: true,
        category: true,
        recruiter: { select: { id: true, name: true } },
      },
    });
    if (!job) return notFound(res, 'Job');
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: update job (edit, publish, close, draft)
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) return notFound(res, 'Job');
    if (!canManageJob(req.user, existing)) return forbidden(res, 'This job belongs to another company');

    const { data, errors } = buildJobData(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    if (data.status === 'PUBLISHED') {
      const companyProblem = await ensureApprovedCompany(req.user);
      if (companyProblem) return res.status(403).json({ message: companyProblem });
    }

    const job = await prisma.job.update({ where: { id }, data });
    res.status(200).json({ message: 'Job updated', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: delete job (only if nobody has applied yet; otherwise close it)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.job.findUnique({
      where: { id },
      include: { _count: { select: { applications: true } } },
    });
    if (!existing) return notFound(res, 'Job');
    if (!canManageJob(req.user, existing)) return forbidden(res, 'This job belongs to another company');
    if (existing._count.applications > 0) {
      return res.status(409).json({ message: 'This job has applicants. Close it instead of deleting it.' });
    }

    await prisma.job.delete({ where: { id } });
    res.status(200).json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: jobs they created. Company admin: every job of their company.
const getMyJobs = async (req, res) => {
  try {
    const where =
      req.user.role === 'COMPANY_ADMIN'
        ? { companyId: req.user.companyId ?? '__none__' }
        : { recruiterId: req.user.userId };

    const jobs = await prisma.job.findMany({
      where,
      include: {
        applications: { select: { id: true, status: true } },
        recruiter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs };
