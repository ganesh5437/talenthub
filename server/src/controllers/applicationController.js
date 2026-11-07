const prisma = require('../config/db');
const {
  ALL_STATUSES, isTerminal, canTransition, getAllowedTransitions, canScheduleInterview, formatStatus,
} = require('../utils/applicationPipeline');
const { canManageJob, notFound, forbidden } = require('../utils/access');

const withPipelineInfo = (app) => ({
  ...app,
  isLocked: isTerminal(app.status),
  allowedTransitions: getAllowedTransitions(app.status),
  canScheduleInterview: canScheduleInterview(app.status),
});

// Candidate: apply to a job
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });

    const candidate = await prisma.candidate.findUnique({ where: { userId: req.user.userId } });
    if (!candidate) return res.status(404).json({ message: 'Candidate profile not found' });

    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
    if (!job || job.status !== 'PUBLISHED' || job.company.status !== 'APPROVED') {
      return res.status(400).json({ message: 'This job is not open for applications' });
    }

    const existing = await prisma.application.findFirst({
      where: { jobId, candidateId: candidate.id },
    });
    if (existing) return res.status(400).json({ message: 'You have already applied to this job' });

    const application = await prisma.application.create({
      data: { jobId, candidateId: candidate.id, status: 'APPLIED' },
    });

    await prisma.notification.create({
      data: {
        userId: job.recruiterId,
        message: `New application received for "${job.title}"`,
      },
    });

    res.status(201).json({ message: 'Applied successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Candidate: view own applications (application tracking)
const getMyApplications = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { userId: req.user.userId } });
    if (!candidate) return res.status(200).json([]);

    const applications = await prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: {
        job: { include: { company: { select: { id: true, name: true } } } },
        interviews: { orderBy: { round: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: view applicants for a specific job (own company only)
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return notFound(res, 'Job');
    if (!canManageJob(req.user, job)) return forbidden(res, 'This job belongs to another company');

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        interviews: { orderBy: { round: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      job: { id: job.id, title: job.title, status: job.status },
      applications: applications.map(withPipelineInfo),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: update application status (ATS pipeline movement)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ALL_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const current = await prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: true },
    });
    if (!current) return notFound(res, 'Application');
    if (!canManageJob(req.user, current.job)) {
      return forbidden(res, 'This application belongs to another company');
    }

    if (current.status === status) {
      return res.status(400).json({ message: `Application is already ${formatStatus(status)}` });
    }

    if (isTerminal(current.status)) {
      return res.status(409).json({
        message: `This application was already marked ${formatStatus(current.status)}. Final decisions cannot be changed.`,
      });
    }

    if (status === 'INTERVIEW_SCHEDULED') {
      return res.status(400).json({ message: 'Use "Schedule Interview" to move a candidate to the interview stage' });
    }

    if (!canTransition(current.status, status)) {
      return res.status(409).json({
        message: `Cannot move an application from ${formatStatus(current.status)} back to ${formatStatus(status)}`,
      });
    }

    // Conditional update guards against two recruiters changing the same application at once.
    const result = await prisma.application.updateMany({
      where: { id, status: current.status },
      data: { status },
    });
    if (result.count === 0) {
      return res.status(409).json({ message: 'Status was changed by someone else. Please refresh.' });
    }

    await prisma.notification.create({
      data: {
        userId: current.candidate.userId,
        message: `Your application for "${current.job.title}" is now: ${formatStatus(status)}`,
      },
    });

    const application = await prisma.application.findUnique({ where: { id } });
    res.status(200).json({ message: 'Status updated', application: withPipelineInfo(application) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus };
