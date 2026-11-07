// Helpers that make sure recruiters/company admins only touch their own company's data.

const canManageJob = (user, job) => !!job && !!user.companyId && job.companyId === user.companyId;

const notFound = (res, what = 'Resource') => res.status(404).json({ message: `${what} not found` });

const forbidden = (res, message = 'You do not have permission to do this') =>
  res.status(403).json({ message });

module.exports = { canManageJob, notFound, forbidden };
