const prisma = require('../config/db');
const { canScheduleInterview, formatStatus, PIPELINE } = require('../utils/applicationPipeline');
const { canManageJob, notFound, forbidden } = require('../utils/access');

// Recruiter: schedule interview
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, round, scheduledAt } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({ message: 'applicationId and scheduledAt are required' });
    }
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid interview date' });
    }
    if (date < new Date()) {
      return res.status(400).json({ message: 'Interview date must be in the future' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, candidate: true },
    });
    if (!application) return notFound(res, 'Application');
    if (!canManageJob(req.user, application.job)) {
      return forbidden(res, 'This application belongs to another company');
    }
    if (!canScheduleInterview(application.status)) {
      return res.status(409).json({
        message: `Cannot schedule an interview for an application that is ${formatStatus(application.status)}`,
      });
    }

    const interview = await prisma.interview.create({
      data: { applicationId, round: Number(round) > 0 ? Number(round) : 1, scheduledAt: date },
    });

    // Only move forward to INTERVIEW_SCHEDULED; never move the application backwards.
    if (PIPELINE.indexOf(application.status) < PIPELINE.indexOf('INTERVIEW_SCHEDULED')) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'INTERVIEW_SCHEDULED' },
      });
    }

    await prisma.notification.create({
      data: {
        userId: application.candidate.userId,
        message: `Interview round ${interview.round} for "${application.job.title}" scheduled on ${date.toUTCString()}`,
      },
    });

    res.status(201).json({ message: 'Interview scheduled', interview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Recruiter: submit feedback/result
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, result } = req.body;

    if (result && !['PENDING', 'PASSED', 'FAILED'].includes(result)) {
      return res.status(400).json({ message: 'Invalid interview result' });
    }

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: { application: { include: { job: true } } },
    });
    if (!existing) return notFound(res, 'Interview');
    if (!canManageJob(req.user, existing.application.job)) {
      return forbidden(res, 'This interview belongs to another company');
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: { feedback, result },
    });

    res.status(200).json({ message: 'Interview updated', interview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { scheduleInterview, updateInterview };
