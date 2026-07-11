const statusStyles = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PUBLISHED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-red-100 text-red-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  SELECTED: 'bg-teal-100 text-teal-700',
  OFFER_RELEASED: 'bg-cyan-100 text-cyan-700',
  HIRED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-slate-100 text-slate-600',
  APPROVED: 'bg-green-100 text-green-700',
  BLOCKED: 'bg-red-100 text-red-700',
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;