const prisma = require('../config/db');

// Candidate: apply to a job
const applyToJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    if (!candidate) return res.status(404).json({ message: 'Candidate profile not found' });

    const existing = await prisma.application.findFirst({
      where: { jobId, candidateId: candidate.id },
    });
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    const application = await prisma.application.create({
      data: { jobId, candidateId: candidate.id, status: 'APPLIED' },
    });

    res.status(201).json({ message: 'Applied successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Candidate: view own applications (application tracking)
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const candidate = await prisma.candidate.findUnique({ where: { userId } });

    const applications = await prisma.application.findMany({
      where: { candidateId: candidate.id },
      include: { job: { include: { company: true } }, interviews: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: view applicants for a specific job
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: { candidate: { include: { user: true } }, interviews: true },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: update application status (ATS pipeline movement)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
      'SELECTED', 'OFFER_RELEASED', 'HIRED', 'REJECTED',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
    });

    // Create notification for candidate
    const candidate = await prisma.candidate.findUnique({ where: { id: application.candidateId } });
    await prisma.notification.create({
      data: {
        userId: candidate.userId,
        message: `Your application status changed to ${status.replace('_', ' ')}`,
      },
    });

    res.status(200).json({ message: 'Status updated', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { applyToJob, getMyApplications, getJobApplicants, updateApplicationStatus };