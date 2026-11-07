const prisma = require('../config/db');

// Update candidate profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const fields = ['resumeUrl', 'skillsCsv', 'experience', 'education', 'portfolio', 'linkedin'];
    const data = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) data[f] = typeof req.body[f] === 'string' ? req.body[f].trim() : req.body[f];
    }

    const candidate = await prisma.candidate.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
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
      include: { user: { select: { id: true, name: true, email: true } } },
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
    if (!candidate) return res.status(404).json({ message: 'Candidate profile not found' });
    if (!jobId) return res.status(400).json({ message: 'jobId is required' });
    const already = await prisma.savedJob.findFirst({ where: { candidateId: candidate.id, jobId } });
    if (already) return res.status(200).json({ message: 'Job already saved', saved: already });
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
    if (!candidate) return res.status(200).json([]);
    const saved = await prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
    });
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { updateProfile, getMyProfile, saveJob, getSavedJobs };