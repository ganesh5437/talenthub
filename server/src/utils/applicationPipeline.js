// Single source of truth for the ATS hiring pipeline.
//
// Rules:
//  - Applications only move FORWARD through the pipeline (stages may be skipped).
//  - REJECTED and HIRED are final decisions: once reached, the status is locked.
//  - INTERVIEW_SCHEDULED is only set by actually scheduling an interview,
//    so every "interview scheduled" application has a real interview record.

const PIPELINE = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'SELECTED',
  'OFFER_RELEASED',
  'HIRED',
];

const TERMINAL_STATUSES = ['HIRED', 'REJECTED'];
const ALL_STATUSES = [...PIPELINE, 'REJECTED'];

// Stages a recruiter can pick manually from the status menu.
const MANUAL_STATUSES = ALL_STATUSES.filter((s) => s !== 'INTERVIEW_SCHEDULED');

const isTerminal = (status) => TERMINAL_STATUSES.includes(status);

const getAllowedTransitions = (current) => {
  if (isTerminal(current)) return [];
  const idx = PIPELINE.indexOf(current);
  const forward = PIPELINE.slice(idx + 1).filter((s) => MANUAL_STATUSES.includes(s));
  return [...forward, 'REJECTED'];
};

const canTransition = (from, to) => getAllowedTransitions(from).includes(to);

// Interviews can be scheduled until the candidate has been selected.
const canScheduleInterview = (status) =>
  !isTerminal(status) && PIPELINE.indexOf(status) <= PIPELINE.indexOf('INTERVIEW_SCHEDULED');

const formatStatus = (status) =>
  status
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');

module.exports = {
  PIPELINE,
  ALL_STATUSES,
  TERMINAL_STATUSES,
  isTerminal,
  getAllowedTransitions,
  canTransition,
  canScheduleInterview,
  formatStatus,
};
