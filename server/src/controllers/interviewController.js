const prisma = require('../config/db');

// Recruiter: schedule interview
const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, round, scheduledAt } = req.body;

    const interview = await prisma.interview.create({
      data: { applicationId, round: round || 1, scheduledAt: new Date(scheduledAt) },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'INTERVIEW_SCHEDULED' },
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