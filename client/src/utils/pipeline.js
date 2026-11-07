// Mirrors server/src/utils/applicationPipeline.js (the server is the source of truth).

export const PIPELINE = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'SELECTED',
  'OFFER_RELEASED',
  'HIRED',
];

export const TERMINAL = ['HIRED', 'REJECTED'];

export const formatStatus = (s = '') =>
  s
    .toLowerCase()
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

export const formatSalary = (min, max) => {
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `From ${fmt(min)}`;
  if (max != null) return `Up to ${fmt(max)}`;
  return null;
};

export const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};
