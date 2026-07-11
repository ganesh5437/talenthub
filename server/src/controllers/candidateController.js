const prisma = require('../config/db');

// Update candidate profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { resumeUrl, skillsCsv, experience, education, portfolio, linkedin } = req.body;

    const candidate = await prisma.candidate.update({
      where: { userId },
      data: { resumeUrl, skillsCsv, experience, education, portfolio, linkedin },
    });

    res.status(200).json({ message: 'Profile updated', candidate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get own candidate profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: { user: true, applications: true, savedJobs: true },
    });
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save a job
const saveJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.body;

    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    const saved = await prisma.savedJob.create({
      data: { candidateId: candidate.id, jobId },
    });

    res.status(201).json({ message: 'Job saved', saved });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const candidate = await prisma.candidate.findUnique({ where: { userId } });
    const saved = await prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
    });
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { updateProfile, getMyProfile, saveJob, getSavedJobs };