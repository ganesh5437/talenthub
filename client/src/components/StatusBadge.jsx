import { formatStatus } from '../utils/pipeline';

const statusStyles = {
  DRAFT: 'bg-slate-100 text-slate-600 ring-slate-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-500 ring-slate-200',
  APPLIED: 'bg-blue-50 text-blue-700 ring-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 ring-amber-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 ring-purple-200',
  INTERVIEW_SCHEDULED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  SELECTED: 'bg-teal-50 text-teal-700 ring-teal-200',
  OFFER_RELEASED: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  HIRED: 'bg-emerald-600 text-white ring-emerald-600',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  BLOCKED: 'bg-red-50 text-red-700 ring-red-200',
  PASSED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  FAILED: 'bg-red-50 text-red-700 ring-red-200',
};

const StatusBadge = ({ status }) => {
  if (!status) return null;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
